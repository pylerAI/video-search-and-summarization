'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _utils = require("../internals/utils");
const rangeStyles = {
  position: 'absolute',
  overflow: 'hidden',
  width: '100%',
  height: '100%',
  clip: 'rect(0, 0, 0, 0)'
};
const Input = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    style,
    ...rest
  } = props;
  return /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
    type: "range",
    readOnly: true,
    ref: ref,
    style: (0, _utils.mergeStyles)(rangeStyles, style)
  }, rest));
});
Input.displayName = 'Input';
var _default = exports.default = Input;