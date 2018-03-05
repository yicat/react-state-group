// @flow
import Group from "./Group";
import Context from "./Context";
export type AnyMap = { [name: string]: any };

export type ActionHandler = (context: Context) => any;
export type ActionMap = { [name: string]: ActionHandler };

export type ReactionHandler = (context: Context, changedState: AnyMap) => void;
export type ReactionMap = { [name: string]: Array<ReactionHandler> };

export type SubscribeHandler = (state: AnyMap) => void;
export type SubscribeMap = { [name: string]: Array<SubscribeHandler> };

export type ChildrenMap = { [name: string]: Group };

export interface GroupInterface {
  +is_app: boolean;
  +is_running: boolean;

  +name: string;
  +path: string;
  +state: AnyMap;

  do(actionPath: string, query?: AnyMap): Promise<any>;
  reaction(groupPath: string, fn: ReactionHandler): void;
  action(name: string, fn: ActionHandler): void;
  setState(patchedState: AnyMap): void;
  subscribe(stateKey: string, fn: SubscribeHandler): void;
  unsubscribe(stateKey: string, fn: SubscribeHandler): void;
  subscribeList(stateKeyList: Array<string>, fn: SubscribeHandler): void;
  unsubscribeList(stateKeyList: Array<string>, fn: SubscribeHandler): void;
  destroy(): void;
  mountGroup(name: string, group: GroupInterface): void;
  unmountGroup(name: string): void;
}
