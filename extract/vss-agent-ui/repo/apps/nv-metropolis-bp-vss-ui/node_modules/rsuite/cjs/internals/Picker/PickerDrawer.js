'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.PickerDrawer = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Drawer = _interopRequireDefault(require("../../Drawer"));
const speakerRef = () => {
  // This is just a no-op callback to satisfy the type requirements
};
const PickerDrawer = exports.PickerDrawer = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    placement = 'bottom',
    speaker,
    onClose,
    open,
    ...rest
  } = props;
  return /*#__PURE__*/_react.default.createElement(_Drawer.default, (0, _extends2.default)({
    placement: placement,
    onClose: onClose,
    open: open,
    ref: ref
  }, rest), typeof speaker === 'function' ? speaker({
    placement
  }, speakerRef) : speaker);
});
PickerDrawer.displayName = 'PickerDrawer';
var _default = exports.default = PickerDrawer;