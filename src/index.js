// @flow
import Group from "./group";
import RootGroup from "./root-group";
import type { AnyMap, GroupInterface } from "./type";

export function group(state?: AnyMap): GroupInterface {
  return new Group(state);
}

export function rootGroup(state?: AnyMap): GroupInterface {
  return new RootGroup(state);
}
