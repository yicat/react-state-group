"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.group = group;
exports.appGroup = appGroup;

var _group = require("./group");

var _group2 = _interopRequireDefault(_group);

var _appGroup = require("./appGroup");

var _appGroup2 = _interopRequireDefault(_appGroup);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function group(state) {
  return new _group2.default(state);
}

function appGroup(state) {
  return new _appGroup2.default(state);
}

var RSG = { group: group, appGroup: appGroup };

exports.default = RSG;