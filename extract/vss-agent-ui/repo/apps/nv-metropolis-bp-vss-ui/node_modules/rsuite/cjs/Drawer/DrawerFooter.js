'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ModalFooter = _interopRequireDefault(require("../Modal/ModalFooter"));
var _utils = require("../internals/utils");
const DrawerFooter = (0, _utils.forwardRef)((props, ref) => {
  return /*#__PURE__*/_react.default.createElement(_ModalFooter.default, (0, _extends2.default)({
    classPrefix: "drawer-footer"
  }, props, {
    ref: ref
  }));
});
DrawerFooter.displayName = 'DrawerFooter';
var _default = exports.default = DrawerFooter;