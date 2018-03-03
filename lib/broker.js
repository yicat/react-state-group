"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group = require("./Group");

var _Group2 = _interopRequireDefault(_Group);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Broker = function () {
  function Broker() {
    _classCallCheck(this, Broker);

    this.listenerMap = {};
  }

  _createClass(Broker, [{
    key: "emit",
    value: function emit(name, msg) {
      if (this.listenerMap[name]) {
        var listenerArray = this.listenerMap[name];
        for (var i = 0, len = listenerArray.length; i < len; i++) {
          var fn = listenerArray[i];
          fn(msg);
        }
      }
    }
  }, {
    key: "addListener",
    value: function addListener(name, fn) {
      if (!this.listenerMap[name]) {
        this.listenerMap[name] = [fn];
        return;
      }

      this.listenerMap[name].push(fn);
    }
  }, {
    key: "removeListener",
    value: function removeListener(name, fn) {
      if (this.listenerMap[name]) {
        var i = this.listenerMap[name].indexOf(fn);
        this.listenerMap[name].splice(i, 1);
      }
    }
  }]);

  return Broker;
}();

exports.default = new Broker();