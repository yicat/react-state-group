"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require("./utils");

var utils = _interopRequireWildcard(_utils);

var _broker = require("./broker");

var _broker2 = _interopRequireDefault(_broker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Group = function () {

  // 支持 version 功能
  // cursor: number = 0
  // versionQueue: Array<Version> = []

  function Group(state) {
    var _this = this;

    _classCallCheck(this, Group);

    this.is_app = false;
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
      "@stateChange": []
    };

    this._groupMountHandler = function (msg) {
      // 触发所有 @groupChange 的监听者
      _this._runAllHandler("@groupMount", { groupPath: msg.group.path });
    };

    this._groupUnmountHandler = function (msg) {
      _this._runAllHandler("@groupUnmount", { groupPath: msg.group.path });
    };

    this._groupChangeHandler = function (msg) {
      var groupPath = msg.group.path;

      if (_this.reactionMap[groupPath]) {
        var reactionHandlerList = _this.reactionMap[groupPath];

        for (var i = 0, len = reactionHandlerList.length; i < len; i++) {
          var reactionHandler = _this.reactionMap[groupPath][i];
          reactionHandler(msg.changedState, msg.group.state);
        }
      }
    };

    this._runAllHandler = function (name, args) {
      if (_this.subscribeMap[name]) {
        for (var i = 0, len = _this.subscribeMap[name].length; i < len; i++) {
          _this.subscribeMap[name][i](args);
        }
      }

      if (name === "@mount" || name === "@unmount") {
        _this.subscribeMap[name] = [];
      }
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
  *  * @mount: 挂载，执行后清空
  *  * @unmount: 卸载，执行后清空
  *  * @groupMount: group 挂载
  *  * @groupUnmount: group 卸载
  *  * @stateChange: group 上的 state 变动
  */


  _createClass(Group, [{
    key: "do",
    value: function _do(actionPath, query) {
      var _this2 = this;

      if (!this.is_running) {
        return new Promise(function (resolve, reject) {
          _this2.subscribeMap["@mount"].push(function () {
            _this2._do(actionPath, query).then(function (state) {
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
      if (this.actionMap[name]) {
        throw new Error("[RSG] the " + name + " children alreay exists");
      }

      if (this.childrenMap[name]) {
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
      if (groupPath[0] !== "/") {
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
    value: function setState(patchedState) {
      var _this3 = this;

      if (!this.is_running) {
        this.subscribeMap["@mount"].push(function () {
          return _this3._setState(patchedState);
        });
        return;
      }

      this._setState(patchedState);
    }

    // 订阅状态

  }, {
    key: "subscribe",
    value: function subscribe(stateKey, fn) {
      if (stateKey === "") return;

      if (this.state[stateKey] === undefined) {
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
      if (this.state[stateKey] === undefined) return;
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
      var _this4 = this;

      if (group.is_app) throw new Error("[RSG] group should not be AppGroup");

      var noRootGroup = group;

      if (this.actionMap[name]) {
        throw new Error("[RSG] the " + name + " group alreay exists");
      }

      if (this.childrenMap[name]) {
        throw new Error("[RSG] the " + name + " children alreay exists");
      }

      var mountChild = function mountChild() {
        noRootGroup.name = name;
        noRootGroup.path = _this4.path === "/" ? "/" + group.name : _this4.path + "/" + group.name;
        noRootGroup.parent = _this4;
        _this4.childrenMap[name] = noRootGroup;
        noRootGroup.root = _this4.root;

        _broker2.default.addListener("groupMount", group._groupMountHandler);
        _broker2.default.addListener("groupUmount", group._groupUnmountHandler);
        _broker2.default.addListener("groupChange", group._groupChangeHandler);

        noRootGroup.is_running = true;
        noRootGroup._runAllHandler("@mount", {});
      };

      if (!this.is_running) {
        this.subscribeMap["@mount"].push(mountChild);
      } else {
        mountChild();
      }
    }

    // 卸载子 group

  }, {
    key: "unmountGroup",
    value: function unmountGroup(name) {
      if (!this.childrenMap[name]) {
        throw new Error("[RSG] not found children: " + name);
      }

      var group = this.childrenMap[name];

      _broker2.default.removeListener("groupMount", group._groupMountHandler);
      _broker2.default.removeListener("groupUmount", group._groupUnmountHandler);
      _broker2.default.removeListener("groupChange", group._groupChangeHandler);

      delete this.childrenMap[name];
      delete group.root;
      delete group.parent;

      this._runAllHandler("@unmount", {});
    }

    // 主动销毁自身

  }, {
    key: "destroy",
    value: function destroy() {
      this.is_running = false;
      this.parent.unmountGroup(this.name);
    }
  }, {
    key: "_do",
    value: function _do(actionPath, query) {
      _broker2.default.emit("do", { group: this, actionPath: actionPath, query: query, timestamp: Date.now() });

      // 跨 group 请求
      if (actionPath[0] === "/") {
        return this.root._do(actionPath, query);
      }

      // 当前 group 请求
      if (!this.actionMap[actionPath]) {
        return Promise.reject("unknow path: " + actionPath);
      }

      var actionHandler = this.actionMap[actionPath];

      return Promise.resolve(actionHandler(query));
    }
  }, {
    key: "_setState",
    value: function _setState(patchedState) {
      if (!patchedState) return;

      if (!utils.isPlainObject(patchedState)) {
        throw new Error("[RSG] patchedState must be primitive object");
      }

      this.state = Object.assign({}, this.state, patchedState);

      var keys = Object.keys(patchedState);
      for (var i = 0, len = keys.length; i < len; i++) {
        this._runAllHandler(keys[i], this.state);
      }

      _broker2.default.emit("groupChange", {
        group: this,
        timestamp: Date.now(),
        changedState: patchedState
      });
    }
  }]);

  return Group;
}();

exports.default = Group;