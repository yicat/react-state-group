// @flow

export function isPlainObject(obj: any): boolean {
  return (
    typeof obj === "object" &&
    obj !== null &&
    obj.constructor === Object &&
    Object.prototype.toString.call(obj) === "[object Object]"
  );
}
