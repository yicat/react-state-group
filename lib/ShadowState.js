"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group = require("./Group");

var _Group2 = _interopRequireDefault(_Group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ShadowState = function () {
  function ShadowState(group) {
    _classCallCheck(this, ShadowState);

    this.changedState = {};

    this.group = group;
  }

  _createClass(ShadowState, [{
    key: "set",
    value: function set(stateKey, value) {
      this.changedState[stateKey] = value;
    }
  }, {
    key: "get",
    value: function get(stateKey) {
      if (this.changedState[stateKey]) {
        return this.changedState[stateKey];
      }

      if (this.group.state[stateKey]) {
        return this.group.state[stateKey];
      }

      return null;
    }
  }, {
    key: "setStateToGroup",
    value: function setStateToGroup() {
      var keys = Object.keys(this.changedState);
      var readyList = [];

      for (var i = 0, len = keys.length; i < len; i++) {
        var key = keys[i];

        // 更新状态
        this.group.state[key] = this.changedState[key];

        if (this.group.subscribeMap[key]) {
          readyList.push(this.group.subscribeMap[key]);
        }
      }

      // 去重
      var uniqReadList = Array.from(new Set(readyList));
      for (var _i = 0, _len = uniqReadList.length; _i < _len; _i++) {
        var fn = uniqReadList[_i];
        fn(this.group.state);
      }

      this.group.root._mq.emit("groupChange", {
        group: this.group,
        timestamp: Date.now(),
        changedState: this.changedState
      });
    }
  }]);

  return ShadowState;
}();

exports.default = ShadowState;