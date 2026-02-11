'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ModalTitle = _interopRequireDefault(require("../Modal/ModalTitle"));
var _utils = require("../internals/utils");
const DrawerTitle = (0, _utils.forwardRef)((props, ref) => {
  return /*#__PURE__*/_react.default.createElement(_ModalTitle.default, (0, _extends2.default)({
    classPrefix: "drawer-title"
  }, props, {
    ref: ref
  }));
});
DrawerTitle.displayName = 'DrawerTitle';
var _default = exports.default = DrawerTitle;