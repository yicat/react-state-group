// @flow
import Group from "./Group";
import AppGroup from "./AppGroup";
import type { AnyMap, GroupInterface } from "./type";

export function group(state?: AnyMap): GroupInterface {
  return new Group(state);
}

export function appGroup(state?: AnyMap): GroupInterface {
  return new AppGroup(state);
}

const RSG = { group, appGroup };

export default RSG;
