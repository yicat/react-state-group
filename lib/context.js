"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _group = require("./group");

var _group2 = _interopRequireDefault(_group);

var _shadowState = require("./shadow-state");

var _shadowState2 = _interopRequireDefault(_shadowState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Context = function () {
  function Context(group, query) {
    _classCallCheck(this, Context);

    if (!query) {
      this.query = {};
    } else {
      this.query = query;
    }

    this.group = group;
    this.state = group.state;
  }

  _createClass(Context, [{
    key: "setState",
    value: function setState(stateKey, value) {
      this.group._setState(stateKey, value);
    }
  }, {
    key: "do",
    value: function _do(path, query) {
      return this.group._do(path, query);
    }
  }, {
    key: "shadowState",
    value: function shadowState() {
      return this.group.shadowState();
    }
  }]);

  return Context;
}();

exports.default = Context;