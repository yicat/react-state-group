// @flow
import Group from "./group";
import Context from "./context";
import ShadowState from "./shadow-state";
export type AnyMap = { [name: string]: any };

export type ActionHandler = (context: Context) => void;
export type ActionMap = { [name: string]: ActionHandler };

export type ReactionHandler = (context: Context, changedState: AnyMap) => void;
export type ReactionMap = { [name: string]: Array<ReactionHandler> };

export type SubscribeHandler = (state: AnyMap) => void;
export type SubscribeMap = { [name: string]: Array<SubscribeHandler> };

export type ChildrenMap = { [name: string]: Group };

export interface GroupInterface {
  +is_root: boolean;
  +is_running: boolean;

  +name: string;
  +path: string;
  +state: AnyMap;

  do(actionPath: string, query?: AnyMap): Promise<any>;
  reaction(groupPath: string, fn: ReactionHandler): void;
  action(name: string, fn: ActionHandler): void;
  setState(stateKey: string, value: any): void;
  shadowState(): ShadowState;
  subscribe(stateKey: string, fn: SubscribeHandler): void;
  unsubscribe(stateKey: string, fn: SubscribeHandler): void;
  subscribeList(stateKeyList: Array<string>, fn: SubscribeHandler): void;
  unsubscribeList(stateKeyList: Array<string>, fn: SubscribeHandler): void;
  destroy(): void;
  mountGroup(name: string, group: Group): void;
  unmountGroup(name: string): void;
}

export interface StateInterface {}
