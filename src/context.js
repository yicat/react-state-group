// @flow
import Group from "./group";
import ShadowState from "./shadow-state";
import type { AnyMap } from "./type";

export default class Context {
  query: AnyMap;
  group: Group;
  state: AnyMap;

  constructor(group: Group, query?: AnyMap) {
    if (!query) {
      this.query = {};
    } else {
      this.query = query;
    }

    this.group = group;
    this.state = group.state;
  }

  setState(stateKey: string, value: any) {
    this.group._setState(stateKey, value);
  }

  do(path: string, query?: AnyMap): Promise<any> {
    return this.group._do(path, query);
  }

  shadowState(): ShadowState {
    return this.group.shadowState();
  }
}
