// @flow
import Group from "./Group";
import Context from "./Context";
import MessageQueue from "./MessageQueue";
import type { AnyMap } from "./type";

export default class AppGroup extends Group {
  constructor(state?: AnyMap) {
    super(state);

    this.is_app = true;
    this.root = this;
    this.name = "root";
    this.path = "";

    this._mq = new MessageQueue();
    this._groupMap[this.path] = this;
  }

  _do(path: string, query?: AnyMap): Promise<any> {
    if (path[0] === "/") {
      const { groupPath, actionName } = this._getGroupPath(path);
      const group = this._groupMap[groupPath];

      if (group) {
        return group._do(actionName, query);
      }
    }

    // root 的 action
    if (!this.actionMap[path]) {
      return Promise.reject("unknow path: " + path);
    }

    const context = new Context(this, query);
    const actionHandler = this.actionMap[path];
    return Promise.resolve(actionHandler(context));
  }

  _getGroupPath(actionPath: string): { groupPath: string, actionName: string } {
    if (actionPath === "/") {
      throw new Error("[RSG] actionPath error: " + actionPath);
    }

    const pathList = actionPath.split("/");
    const groupPath = pathList.slice(0, pathList.length - 1).join("/");
    const actionName = pathList.slice(pathList.length - 1, pathList.length)[0];

    return { groupPath, actionName };
  }
}
