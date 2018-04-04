// @flow
import * as utils from "./utils";
import Context from "./Context";
import broker from "./broker";
import type {
  AnyMap,
  ActionMap,
  ActionHandler,
  SubscribeMap,
  SubscribeHandler,
  ReactionMap,
  ReactionHandler,
  ChildrenMap,
  GroupInterface
} from "./type";

export default class Group {
  is_app: boolean = false;
  is_running: boolean = false;

  name: string = "";
  path: string = "";

  root: Group;
  parent: Group;
  childrenMap: ChildrenMap = {};

  state: AnyMap = {};
  actionMap: ActionMap = {};
  reactionMap: ReactionMap = {};

  /*  
  * 特殊的触发事件 
  *  * @mount: 挂载，执行后清空
  *  * @unmount: 卸载，执行后清空
  *  * @groupMount: group 挂载
  *  * @groupUnmount: group 卸载
  *  * @stateChange: group 上的 state 变动
  */
  subscribeMap: SubscribeMap = {
    "@mount": [],
    "@unmount": [],
    "@groupMount": [],
    "@groupUnmount": [],
    "@stateChange": []
  };

  // 支持 version 功能
  // cursor: number = 0
  // versionQueue: Array<Version> = []

  constructor(state?: AnyMap) {
    if (!state) return;

    if (!utils.isPlainObject(state)) {
      throw new Error("[RSG] state must be primitive object");
    }

    this.state = state;
  }

  // 发出 Action 请求
  do(actionPath: string, query?: AnyMap): Promise<any> {
    if (!this.is_running) {
      return new Promise((resolve, reject) => {
        this.subscribeMap["@mount"].push(() => {
          this._do(actionPath, query)
            .then(state => resolve(state))
            .catch(error => reject(error));
        });
      });
    }

    return this._do(actionPath, query);
  }

  // 监听 action 请求
  action(name: string, fn: ActionHandler) {
    if (this.actionMap[name]) {
      throw new Error(`[RSG] the ${name} children alreay exists`);
    }

    if (this.childrenMap[name]) {
      throw new Error(`[RSG] the ${name} group alreay exists`);
    }

    const checkNameRegex = /[0-9a-zA-Z_-]+/g;
    if (!checkNameRegex.test(name)) {
      throw new Error("[RSG] action name is invalid, the name is: " + name);
    }

    this.actionMap[name] = fn;
  }

  // 监听 group 变化
  reaction(groupPath: string, fn: ReactionHandler) {
    if (groupPath[0] !== "/") {
      throw new Error("[RSG] the groupPath must be start with /");
    }

    if (!this.reactionMap[groupPath]) {
      this.reactionMap[groupPath] = [fn];
    } else {
      this.reactionMap[groupPath].push(fn);
    }
  }

  // 更新状态，触发 group 变化
  setState(patchedState?: AnyMap) {
    if (!this.is_running) {
      this.subscribeMap["@mount"].push(() => this._setState(patchedState));
      return;
    }

    this._setState(patchedState);
  }

  // 订阅状态
  subscribe(stateKey: string, fn: SubscribeHandler): void {
    if (stateKey === "") return;

    if (this.state[stateKey] === undefined) {
      throw new Error("[RSG] not found stateKey: " + stateKey);
    }

    if (!this.subscribeMap[stateKey]) {
      this.subscribeMap[stateKey] = [fn];
    }

    this.subscribeMap[stateKey].push(fn);
  }

  // 取消订阅状态
  unsubscribe(stateKey: string, fn: SubscribeHandler): void {
    if (this.state[stateKey] === undefined) return;
    if (!this.subscribeMap[stateKey] || this.subscribeMap[stateKey].length === 0) return;

    const index = this.subscribeMap[stateKey].indexOf(fn);
    if (index !== -1) {
      this.subscribeMap[stateKey].splice(index, 1);
      return;
    }

    return;
  }

  // 订阅状态列表
  subscribeList(stateKeyArray: Array<string>, fn: SubscribeHandler): void {
    for (let i = 0, len = stateKeyArray.length; i < len; i++) {
      this.subscribe(stateKeyArray[i], fn);
    }
  }

  // 取消订阅状态列表
  unsubscribeList(stateKeyArray: Array<string>, fn: SubscribeHandler): void {
    for (let i = 0, len = stateKeyArray.length; i < len; i++) {
      this.unsubscribe(stateKeyArray[i], fn);
    }
  }

  // 挂载子 group
  mountGroup(name: string, group: Group) {
    if (group.is_app) throw new Error("[RSG] group should not be AppGroup");

    const noRootGroup: Group = (group: any);

    if (this.actionMap[name]) {
      throw new Error(`[RSG] the ${name} group alreay exists`);
    }

    if (this.childrenMap[name]) {
      throw new Error(`[RSG] the ${name} children alreay exists`);
    }

    const mountChild = () => {
      noRootGroup.name = name;
      noRootGroup.path = this.path === "/" ? `/${group.name}` : `${this.path}/${group.name}`;
      noRootGroup.parent = this;
      this.childrenMap[name] = noRootGroup;
      noRootGroup.root = this.root;

      broker.addListener("groupMount", group._groupMountHandler);
      broker.addListener("groupUmount", group._groupUnmountHandler);
      broker.addListener("groupChange", group._groupChangeHandler);

      noRootGroup.is_running = true;
      noRootGroup._runAllHandler("@mount", {});
    };

    if (!this.is_running) {
      this.subscribeMap["@mount"].push(mountChild);
    } else {
      mountChild();
    }
  }

  // 卸载子 group
  unmountGroup(name: string) {
    if (!this.childrenMap[name]) {
      throw new Error("[RSG] not found children: " + name);
    }

    const group = this.childrenMap[name];

    broker.removeListener("groupMount", group._groupMountHandler);
    broker.removeListener("groupUmount", group._groupUnmountHandler);
    broker.removeListener("groupChange", group._groupChangeHandler);

    delete this.childrenMap[name];
    delete group.root;
    delete group.parent;

    this._runAllHandler("@unmount", {});
  }

  // 主动销毁自身
  destroy() {
    this.is_running = false;
    this.parent.unmountGroup(this.name);
  }

  _do(actionPath: string, query?: AnyMap): Promise<any> {
    broker.emit("do", { group: this, actionPath, query, timestamp: Date.now() });

    // 跨 group 请求
    if (actionPath[0] === "/") {
      return this.root._do(actionPath, query);
    }

    // 当前 group 请求
    if (!this.actionMap[actionPath]) {
      return Promise.reject("unknow path: " + actionPath);
    }

    const context = new Context(this, query);
    const actionHandler = this.actionMap[actionPath];

    return Promise.resolve(actionHandler(context));
  }

  _setState(patchedState?: AnyMap): void {
    if (!patchedState) return;

    if (!utils.isPlainObject(patchedState)) {
      throw new Error("[RSG] patchedState must be primitive object");
    }

    this.state = Object.assign({}, this.state, patchedState);

    const keys = Object.keys(patchedState);
    for (let i = 0, len = keys.length; i < len; i++) {
      this._runAllHandler(keys[i], this.state);
    }

    broker.emit("groupChange", {
      group: this,
      timestamp: Date.now(),
      changedState: patchedState
    });
  }

  _groupMountHandler = (msg: any) => {
    // 触发所有 @groupChange 的监听者
    this._runAllHandler("@groupMount", { groupPath: msg.group.path });
  };

  _groupUnmountHandler = (msg: any) => {
    this._runAllHandler("@groupUnmount", { groupPath: msg.group.path });
  };

  _groupChangeHandler = (msg: any) => {
    const groupPath = msg.group.path;

    if (this.reactionMap[groupPath]) {
      const reactionHandlerList = this.reactionMap[groupPath];

      for (let i = 0, len = reactionHandlerList.length; i < len; i++) {
        const reactionHandler = this.reactionMap[groupPath][i];
        reactionHandler(msg.changedState, msg.group.state);
      }
    }
  };

  _runAllHandler = (name: string, args: any) => {
    if (this.subscribeMap[name]) {
      for (let i = 0, len = this.subscribeMap[name].length; i < len; i++) {
        this.subscribeMap[name][i](args);
      }
    }

    if (name === "@mount" || name === "@unmount") {
      this.subscribeMap[name] = [];
    }
  };
}
