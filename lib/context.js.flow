// @flow
import Group from "./Group";
import ShadowState from "./ShadowState";
import type { AnyMap } from "./type";

export default class Context {
  _target_group: Group;

  global: AnyMap = {};
  // local: AnyMap = {};
  query: AnyMap = {};

  constructor(group: Group, query?: AnyMap) {
    if (!query) {
      this.query = {};
    } else {
      this.query = query;
    }

    this._target_group = group;
    this.global = group.root.state;
  }

  setState(stateKey: string, value: any) {
    this._target_group._setState(stateKey, value);
  }

  do(path: string, query?: AnyMap): Promise<any> {
    return this._target_group._do(path, query);
  }

  shadowState(): ShadowState {
    return this._target_group.shadowState();
  }
}
