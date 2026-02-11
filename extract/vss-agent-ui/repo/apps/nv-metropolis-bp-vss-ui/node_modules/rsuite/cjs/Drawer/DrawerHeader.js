'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ModalHeader = _interopRequireDefault(require("../Modal/ModalHeader"));
var _utils = require("../internals/utils");
const DrawerHeader = (0, _utils.forwardRef)((props, ref) => {
  return /*#__PURE__*/_react.default.createElement(_ModalHeader.default, (0, _extends2.default)({
    classPrefix: "drawer-header"
  }, props, {
    ref: ref
  }));
});
DrawerHeader.displayName = 'DrawerHeader';
var _default = exports.default = DrawerHeader;