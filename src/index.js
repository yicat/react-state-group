// @flow
import Group from "./Group";
import AppGroup from "./AppGroup";
import type { AnyMap, GroupInterface } from "./type";

export function group(state?: AnyMap): Group {
  return new Group(state);
}

export function appGroup(state?: AnyMap): AppGroup {
  return new AppGroup(state);
}

const RSG = { group, appGroup };

export default RSG;
