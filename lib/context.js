"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group = require("./Group");

var _Group2 = _interopRequireDefault(_Group);

var _ShadowState = require("./ShadowState");

var _ShadowState2 = _interopRequireDefault(_ShadowState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function () {
  function Context(group, query) {
    _classCallCheck(this, Context);

    this.global = {};
    this.query = {};

    if (!query) {
      this.query = {};
    } else {
      this.query = query;
    }

    this._target_group = group;
    this.global = group.root.state;
  }
  // local: AnyMap = {};


  _createClass(Context, [{
    key: "setState",
    value: function setState(stateKey, value) {
      this._target_group._setState(stateKey, value);
    }
  }, {
    key: "do",
    value: function _do(path, query) {
      return this._target_group._do(path, query);
    }
  }, {
    key: "shadowState",
    value: function shadowState() {
      return this._target_group.shadowState();
    }
  }]);

  return Context;
}();

exports.default = Context;