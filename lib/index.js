"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.group = group;
exports.appGroup = appGroup;

var _Group = require("./Group");

var _Group2 = _interopRequireDefault(_Group);

var _AppGroup = require("./AppGroup");

var _AppGroup2 = _interopRequireDefault(_AppGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function group(state) {
  return new _Group2.default(state);
}

function appGroup(state) {
  return new _AppGroup2.default(state);
}

var RSG = { group: group, appGroup: appGroup };

exports.default = RSG;