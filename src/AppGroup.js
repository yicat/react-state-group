// @flow
import Group from "./Group";
import Context from "./Context";
import broker from "./broker";
import type { AnyMap } from "./type";

export default class AppGroup extends Group {
  constructor(state?: AnyMap) {
    super(state);

    this.is_app = true;
    this.root = this;
    this.name = "root";
    this.path = "";
    this.is_running = true;
  }

  _do(path: string, query?: AnyMap): Promise<any> {
    if (path[0] === "/") {
      const { groupPath, actionName } = this._getGroupPath(path);
      const group = this._getGroup(groupPath);

      return group._do(actionName, query);
    }

    // root 的 action
    if (!this.actionMap[path]) {
      return Promise.reject("[RSG] unknow action path: " + path);
    }

    const context = new Context(this, query);
    const actionHandler = this.actionMap[path];
    return Promise.resolve(actionHandler(context));
  }

  _getGroup(groupPath: string): Group {
    let crtGroup = this;

    if (groupPath === "") return crtGroup;

    const groupPathList = groupPath.slice(1).split("/");
    for (let i = 0, len = groupPathList.length; i < len; i++) {
      crtGroup = crtGroup.childrenMap[groupPathList[i]];
      if (!crtGroup) {
        throw new Error("[RSG] unknow group path: " + groupPath);
      }
    }

    return crtGroup;
  }

  _getGroupPath(actionPath: string): { groupPath: string, actionName: string } {
    if (actionPath === "/") {
      throw new Error("[RSG] unknow action path: " + actionPath);
    }

    const pathList = actionPath.split("/");
    const groupPath = pathList.slice(0, pathList.length - 1).join("/");
    const actionName = pathList.slice(pathList.length - 1, pathList.length)[0];

    return { groupPath, actionName };
  }
}
