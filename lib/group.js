"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var utils = _interopRequireWildcard(_utils);

var _shadowState = require("./shadow-state");

var _shadowState2 = _interopRequireDefault(_shadowState);

var _rootGroup = require("./root-group");

var _rootGroup2 = _interopRequireDefault(_rootGroup);

var _context = require("./context");

var _context2 = _interopRequireDefault(_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Group = function () {

  // 支持 version 功能
  // cursor: number = 0
  // versionQueue: Array<Version> = []

  function Group(state) {
    _classCallCheck(this, Group);

    this.is_root = false;
    this.is_running = false;
    this.name = "";
    this.path = "";
    this.childrenMap = {};
    this.state = {};
    this.actionMap = {};
    this.reactionMap = {};
    this.subscribeMap = {
      "@mount": [],
      "@unmount": [],
      "@groupMount": [],
      "@groupUnmount": [],
      "@stateChange": [],
      "@willDestory": [],
      "@didDestory": []
    };

    if (!state) return;

    if (!utils.isPlainObject(state)) {
      throw new Error("[RSG] state must be primitive object");
    }

    this.state = state;
  }

  // 发出 Action 请求


  /*  
  * 特殊的触发事件 
  *  * @mount: 挂载
  *  * @unmount: 卸载
  *  * @groupMount: group 挂载
  *  * @groupUnmount: group 卸载
  *  * @stateChange: group 上的 state 变动
  *  * @willDestroy: 准备 destroy
  *  * @didDestroy: 完成 destroy
  */


  _createClass(Group, [{
    key: "do",
    value: function _do(actionPath, query) {
      var _this = this;

      if (!this.is_running) {
        return new Promise(function (resolve, reject) {
          _this.subscribeMap["@mount"].push(function () {
            _this._do(actionPath, query).then(function (state) {
              return resolve(state);
            }).catch(function (error) {
              return reject(error);
            });
          });
        });
      }

      return this._do(actionPath, query);
    }

    // 监听 action 请求

  }, {
    key: "action",
    value: function action(name, fn) {
      if (!this.actionMap[name]) {
        throw new Error("[RSG] the " + name + " children alreay exists");
      }

      if (!this.childrenMap[name]) {
        throw new Error("[RSG] the " + name + " group alreay exists");
      }

      var checkNameRegex = /[0-9a-zA-Z_-]+/g;
      if (!checkNameRegex.test(name)) {
        throw new Error("[RSG] action name is invalid, the name is: " + name);
      }

      this.actionMap[name] = fn;
    }

    // 监听 group 变化

  }, {
    key: "reaction",
    value: function reaction(groupPath, fn) {
      if (groupPath !== "/") {
        throw new Error("[RSG] the groupPath must be start with /");
      }

      if (!this.reactionMap[groupPath]) {
        this.reactionMap[groupPath] = [fn];
      } else {
        this.reactionMap[groupPath].push(fn);
      }
    }

    // 更新状态，触发 group 变化

  }, {
    key: "setState",
    value: function setState(stateKey, value) {
      var _this2 = this;

      if (!this.is_running) {
        this.subscribeMap["@mount"].push(function () {
          _this2._setState(stateKey, value);
        });

        return;
      }

      this._setState(stateKey, value);
    }
  }, {
    key: "shadowState",
    value: function shadowState() {
      return new _shadowState2.default(this);
    }

    // 订阅状态

  }, {
    key: "subscribe",
    value: function subscribe(stateKey, fn) {
      if (stateKey === "") return;

      if (!this.state[stateKey]) {
        throw new Error("[RSG] not found stateKey: " + stateKey);
      }

      if (!this.subscribeMap[stateKey]) {
        this.subscribeMap[stateKey] = [fn];
      }

      this.subscribeMap[stateKey].push(fn);
    }

    // 取消订阅状态

  }, {
    key: "unsubscribe",
    value: function unsubscribe(stateKey, fn) {
      if (!this.state[stateKey]) return;
      if (!this.subscribeMap[stateKey] || this.subscribeMap[stateKey].length === 0) return;

      var index = this.subscribeMap[stateKey].indexOf(fn);
      if (index !== -1) {
        this.subscribeMap[stateKey].splice(index, 1);
        return;
      }

      return;
    }

    // 订阅状态列表

  }, {
    key: "subscribeList",
    value: function subscribeList(stateKeyArray, fn) {
      for (var i = 0, len = stateKeyArray.length; i < len; i++) {
        this.subscribe(stateKeyArray[i], fn);
      }
    }

    // 取消订阅状态列表

  }, {
    key: "unsubscribeList",
    value: function unsubscribeList(stateKeyArray, fn) {
      for (var i = 0, len = stateKeyArray.length; i < len; i++) {
        this.unsubscribe(stateKeyArray[i], fn);
      }
    }

    // 挂载子 group

  }, {
    key: "mountGroup",
    value: function mountGroup(name, group) {
      if (!this.actionMap[name]) {
        throw new Error("[RSG] the " + name + " children alreay exists");
      }

      if (!this.childrenMap[name]) {
        throw new Error("[RSG] the " + name + " group alreay exists");
      }

      group.name = name;
      group.path = group.name + "/" + this.name;
      group.parent = this;
      this.childrenMap[name] = group;

      group.root = this.root;
      group.root.mq.addListener("groupMount", this._groupMountHandler);
      group.root.mq.addListener("groupUmount", this._groupUnmountHandler);
      group.root.mq.addListener("groupChange", this._groupChangeHandler);
      group.root.groupMap[group.path] = group;

      group._runAllHandler("@mount", {});
      group.is_running = true;
    }

    // 卸载子 group

  }, {
    key: "unmountGroup",
    value: function unmountGroup(name) {
      if (!this.childrenMap[name]) {
        throw new Error("[RSG] not found children: " + name);
      }

      var group = this.childrenMap[name];

      group.root.mq.removeListener("groupMount", this._groupMountHandler);
      group.root.mq.removeListener("groupUmount", this._groupUnmountHandler);
      group.root.mq.removeListener("groupChange", this._groupChangeHandler);
      group.root.groupMap[group.path] = undefined;

      delete this.childrenMap[name];
      delete group.root;
      delete group.parent;

      this._runAllHandler("@unmount", {});
    }

    // 主动销毁自身

  }, {
    key: "destroy",
    value: function destroy() {
      this._runAllHandler("@willDestroy", {});
      this.is_running = false;
      this.parent.unmountGroup(this.name);

      this._runAllHandler("@didDestroy", {});
    }
  }, {
    key: "_do",
    value: function _do(actionPath, query) {
      // metrics
      this.root.mq.emit("do", { group: this, actionPath: actionPath, query: query, timestamp: Date.now() });

      // 跨 group 请求
      if (actionPath[0] === "/") {
        return this.root._do(actionPath, query);
      }

      // 当前 group 请求
      if (!this.actionMap[actionPath]) {
        return Promise.reject("unknow path: " + actionPath);
      }

      var context = new _context2.default(this, query);
      var actionHandler = this.actionMap[actionPath];
      actionHandler(context);
      return Promise.resolve(this.state);
    }
  }, {
    key: "_setState",
    value: function _setState(stateKey, value) {
      // metrics
      this.root.mq.emit("groupChange", {
        group: this,
        timestamp: Date.now(),
        changedState: _defineProperty({}, stateKey, value)
      });

      if (this.state[stateKey] || this.shadowState[stateKey]) {
        throw new Error("[RSG] the statusKey: " + stateKey + " alreay exists");
      }

      if (!this.state[stateKey]) {
        return false;
      }

      this.state[stateKey] = value;

      if (this.subscribeMap[stateKey]) {
        this._runAllHandler(stateKey, this.state);
      }

      return true;
    }
  }, {
    key: "_groupMountHandler",
    value: function _groupMountHandler(msg) {
      // 触发所有 @groupChange 的监听者
      this._runAllHandler("@groupMount", { groupPath: msg.group.path });
    }
  }, {
    key: "_groupUnmountHandler",
    value: function _groupUnmountHandler(msg) {
      this._runAllHandler("@groupUnmount", { groupPath: msg.group.path });
    }
  }, {
    key: "_groupChangeHandler",
    value: function _groupChangeHandler(msg) {
      var groupPath = msg.group.path;

      if (this.reactionMap[groupPath]) {
        var reactionHandlerList = this.reactionMap[groupPath];
        for (var i = 0, len = reactionHandlerList.length; i < len; i++) {
          var context = new _context2.default(msg.group, {});
          var reactionHandler = this.reactionMap[groupPath][i];
          reactionHandler(context, msg.changedState);
        }
      }
    }
  }, {
    key: "_runAllHandler",
    value: function _runAllHandler(name, args) {
      if (this.subscribeMap[name]) {
        for (var i = 0, len = this.subscribeMap[name].length; i < len; i++) {
          this.subscribeMap[name][i](args);
        }
      }
    }
  }]);

  return Group;
}();

exports.default = Group;