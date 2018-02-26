"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.group = group;
exports.rootGroup = rootGroup;

var _group = require("./group");

var _group2 = _interopRequireDefault(_group);

var _rootGroup = require("./root-group");

var _rootGroup2 = _interopRequireDefault(_rootGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function group(state) {
  return new _group2.default(state);
}

function rootGroup(state) {
  return new _rootGroup2.default(state);
}

var RSG = { group: group, rootGroup: rootGroup };

exports.default = RSG;