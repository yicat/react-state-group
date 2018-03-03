// @flow
import type { AnyMap } from "./type";

type Listener = (msg: AnyMap) => void;

export default class MessageQueue {
  listenerList: { [name: string]: Array<Listener> } = {};

  emit(name: string, msg: any) {
    if (this.listenerList[name]) {
      const listenerArray: any = this.listenerList[name];
      for (let i = 0, len = listenerArray.length; i < len; i++) {
        const fn: any = listenerArray[i];
        fn(msg);
      }
    }
  }

  addListener(name: string, fn: Listener) {
    if (!this.listenerList[name]) {
      this.listenerList[name] = [fn];
      return;
    }

    this.listenerList[name].push(fn);
  }

  removeListener(name: string, fn: Listener) {
    if (this.listenerList[name]) {
      const i = this.listenerList[name].indexOf(fn);
      this.listenerList[name].splice(i, 1);
    }
  }
}
