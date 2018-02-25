"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.isPlainObject = isPlainObject;
function isPlainObject(obj) {
  return (typeof obj === "undefined" ? "undefined" : _typeof(obj)) === "object" && obj !== null && obj.constructor === Object && Object.prototype.toString.call(obj) === "[object Object]";
}