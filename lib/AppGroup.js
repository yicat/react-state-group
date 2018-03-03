"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Group2 = require("./Group");

var _Group3 = _interopRequireDefault(_Group2);

var _Context = require("./Context");

var _Context2 = _interopRequireDefault(_Context);

var _MessageQueue = require("./MessageQueue");

var _MessageQueue2 = _interopRequireDefault(_MessageQueue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AppGroup = function (_Group) {
  _inherits(AppGroup, _Group);

  function AppGroup(state) {
    _classCallCheck(this, AppGroup);

    var _this = _possibleConstructorReturn(this, (AppGroup.__proto__ || Object.getPrototypeOf(AppGroup)).call(this, state));

    _this.is_app = true;
    _this.root = _this;
    _this.name = "root";
    _this.path = "";

    _this._mq = new _MessageQueue2.default();
    _this._groupMap[_this.path] = _this;
    return _this;
  }

  _createClass(AppGroup, [{
    key: "_do",
    value: function _do(path, query) {
      if (path[0] === "/") {
        var _getGroupPath2 = this._getGroupPath(path),
            groupPath = _getGroupPath2.groupPath,
            actionName = _getGroupPath2.actionName;

        var group = this._groupMap[groupPath];

        if (group) {
          return group._do(actionName, query);
        }
      }

      // root 的 action
      if (!this.actionMap[path]) {
        return Promise.reject("unknow path: " + path);
      }

      var context = new _Context2.default(this, query);
      var actionHandler = this.actionMap[path];
      return Promise.resolve(actionHandler(context));
    }
  }, {
    key: "_getGroupPath",
    value: function _getGroupPath(actionPath) {
      if (actionPath === "/") {
        throw new Error("[RSG] actionPath error: " + actionPath);
      }

      var pathList = actionPath.split("/");
      var groupPath = pathList.slice(0, pathList.length - 1).join("/");
      var actionName = pathList.slice(pathList.length - 1, pathList.length)[0];

      return { groupPath: groupPath, actionName: actionName };
    }
  }]);

  return AppGroup;
}(_Group3.default);

exports.default = AppGroup;