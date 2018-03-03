// @flow
import Group from "./Group";
import type { AnyMap } from "./type";

type Listener = (msg: AnyMap) => void;

class Broker {
  listenerMap: { [name: string]: Array<Listener> } = {};

  emit(name: string, msg: any) {
    if (this.listenerMap[name]) {
      const listenerArray: any = this.listenerMap[name];
      for (let i = 0, len = listenerArray.length; i < len; i++) {
        const fn: any = listenerArray[i];
        fn(msg);
      }
    }
  }

  addListener(name: string, fn: Listener) {
    if (!this.listenerMap[name]) {
      this.listenerMap[name] = [fn];
      return;
    }

    this.listenerMap[name].push(fn);
  }

  removeListener(name: string, fn: Listener) {
    if (this.listenerMap[name]) {
      const i = this.listenerMap[name].indexOf(fn);
      this.listenerMap[name].splice(i, 1);
    }
  }
}

export default new Broker();
