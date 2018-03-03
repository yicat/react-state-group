// @flow
import Group from "./Group";
import type { AnyMap } from "./type";

export default class ShadowState {
  group: Group;
  changedState: AnyMap = {};

  constructor(group: Group) {
    this.group = group;
  }

  set(stateKey: string, value: any) {
    this.changedState[stateKey] = value;
  }

  get(stateKey: string): any {
    if (this.changedState[stateKey]) {
      return this.changedState[stateKey];
    }

    if (this.group.state[stateKey]) {
      return this.group.state[stateKey];
    }

    return null;
  }

  setStateToGroup() {
    const keys = Object.keys(this.changedState);
    const readyList = [];

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      // 更新状态
      this.group.state[key] = this.changedState[key];

      if (this.group.subscribeMap[key]) {
        readyList.push(this.group.subscribeMap[key]);
      }
    }

    // 去重
    const uniqReadList = Array.from(new Set(readyList));
    for (let i = 0, len = uniqReadList.length; i < len; i++) {
      const fn: any = uniqReadList[i];
      fn(this.group.state);
    }

    this.group.root._mq.emit("groupChange", {
      group: this.group,
      timestamp: Date.now(),
      changedState: this.changedState
    });
  }
}
