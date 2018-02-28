// @flow
import * as utils from "./utils";
import ShadowState from "./shadow-state";
import MessageQueue from "./message-queue";
import Context from "./context";
import type {
  AnyMap,
  ActionMap,
  ActionHandler,
  SubscribeMap,
  SubscribeHandler,
  ReactionMap,
  ReactionHandler,
  ChildrenMap
} from "./type";

export default class Group {
  is_root: boolean = false;
  is_running: boolean = false;

  // only for root
  _mq: MessageQueue;
  _groupMap: { [name: string]: Group } = {};

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
  *  * @mount: 挂载
  *  * @unmount: 卸载
  *  * @groupMount: group 挂载
  *  * @groupUnmount: group 卸载
  *  * @stateChange: group 上的 state 变动
  *  * @willDestroy: 准备 destroy
  *  * @didDestroy: 完成 destroy
  */
  subscribeMap: SubscribeMap = {
    "@mount": [],
    "@unmount": [],
    "@groupMount": [],
    "@groupUnmount": [],
    "@stateChange": [],
    "@willDestory": [],
    "@didDestory": []
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
    if (!this.actionMap[name]) {
      throw new Error(`[RSG] the ${name} children alreay exists`);
    }

    if (!this.childrenMap[name]) {
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
    if (groupPath !== "/") {
      throw new Error("[RSG] the groupPath must be start with /");
    }

    if (!this.reactionMap[groupPath]) {
      this.reactionMap[groupPath] = [fn];
    } else {
      this.reactionMap[groupPath].push(fn);
    }
  }

  // 更新状态，触发 group 变化
  setState(stateKey: string, value: any) {
    if (!this.is_running) {
      this.subscribeMap["@mount"].push(() => {
        this._setState(stateKey, value);
      });

      return;
    }

    this._setState(stateKey, value);
  }

  shadowState(): ShadowState {
    return new ShadowState(this);
  }

  // 订阅状态
  subscribe(stateKey: string, fn: SubscribeHandler): void {
    if (stateKey === "") return;

    if (!this.state[stateKey]) {
      throw new Error("[RSG] not found stateKey: " + stateKey);
    }

    if (!this.subscribeMap[stateKey]) {
      this.subscribeMap[stateKey] = [fn];
    }

    this.subscribeMap[stateKey].push(fn);
  }

  // 取消订阅状态
  unsubscribe(stateKey: string, fn: SubscribeHandler): void {
    if (!this.state[stateKey]) return;
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
    if (!this.actionMap[name]) {
      throw new Error(`[RSG] the ${name} children alreay exists`);
    }

    if (!this.childrenMap[name]) {
      throw new Error(`[RSG] the ${name} group alreay exists`);
    }

    group.name = name;
    group.path = `${group.name}/${this.name}`;
    group.parent = this;
    this.childrenMap[name] = group;

    group.root = this.root;
    group.root._mq.addListener("groupMount", this._groupMountHandler);
    group.root._mq.addListener("groupUmount", this._groupUnmountHandler);
    group.root._mq.addListener("groupChange", this._groupChangeHandler);
    group.root._groupMap[group.path] = group;

    group._runAllHandler("@mount", {});
    group.is_running = true;
  }

  // 卸载子 group
  unmountGroup(name: string) {
    if (!this.childrenMap[name]) {
      throw new Error("[RSG] not found children: " + name);
    }

    const group = this.childrenMap[name];

    group.root._mq.removeListener("groupMount", this._groupMountHandler);
    group.root._mq.removeListener("groupUmount", this._groupUnmountHandler);
    group.root._mq.removeListener("groupChange", this._groupChangeHandler);

    delete group.root._groupMap[group.path];
    delete this.childrenMap[name];
    delete group.root;
    delete group.parent;

    this._runAllHandler("@unmount", {});
  }

  // 主动销毁自身
  destroy() {
    this._runAllHandler("@willDestroy", {});
    this.is_running = false;
    this.parent.unmountGroup(this.name);

    this._runAllHandler("@didDestroy", {});
  }

  _do(actionPath: string, query?: AnyMap): Promise<any> {
    // metrics
    this.root._mq.emit("do", { group: this, actionPath, query, timestamp: Date.now() });

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

  _setState(stateKey: string, value: any): boolean {
    // metrics
    this.root._mq.emit("groupChange", {
      group: this,
      timestamp: Date.now(),
      changedState: { [stateKey]: value }
    });

    if (this.state[stateKey] || this.shadowState[stateKey]) {
      throw new Error("[RSG] the statusKey: " + stateKey + " alreay exists");
    }

    if (!this.state[stateKey]) {
      return false;
    }

    this.state[stateKey] = value;

    if (this.subscribeMap[stateKey]) {
      this._runAllHandler(stateKey, this.state);
    }

    return true;
  }

  _groupMountHandler(msg: any) {
    // 触发所有 @groupChange 的监听者
    this._runAllHandler("@groupMount", { groupPath: msg.group.path });
  }

  _groupUnmountHandler(msg: any) {
    this._runAllHandler("@groupUnmount", { groupPath: msg.group.path });
  }

  _groupChangeHandler(msg: any) {
    const groupPath = msg.group.path;

    if (this.reactionMap[groupPath]) {
      const reactionHandlerList = this.reactionMap[groupPath];
      for (let i = 0, len = reactionHandlerList.length; i < len; i++) {
        const context = new Context(msg.group, {});
        const reactionHandler = this.reactionMap[groupPath][i];
        reactionHandler(context, msg.changedState);
      }
    }
  }

  _runAllHandler(name: string, args: any) {
    if (this.subscribeMap[name]) {
      for (let i = 0, len = this.subscribeMap[name].length; i < len; i++) {
        this.subscribeMap[name][i](args);
      }
    }
  }
}
