"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MessageQueue = function () {
  function MessageQueue() {
    _classCallCheck(this, MessageQueue);

    this.listenerList = {};
  }

  _createClass(MessageQueue, [{
    key: "emit",
    value: function emit(name, msg) {
      if (this.listenerList[name]) {
        var listenerArray = this.listenerList[name];
        for (var i = 0, len = listenerArray.length; i < len; i++) {
          var fn = listenerArray[i];
          fn(msg);
        }
      }
    }
  }, {
    key: "addListener",
    value: function addListener(name, fn) {
      if (!this.listenerList[name]) {
        this.listenerList[name] = [fn];
        return;
      }

      this.listenerList[name].push(fn);
    }
  }, {
    key: "removeListener",
    value: function removeListener(name, fn) {
      if (this.listenerList[name]) {
        var i = this.listenerList[name].indexOf(fn);
        this.listenerList[name].splice(i, 1);
      }
    }
  }]);

  return MessageQueue;
}();

exports.default = MessageQueue;