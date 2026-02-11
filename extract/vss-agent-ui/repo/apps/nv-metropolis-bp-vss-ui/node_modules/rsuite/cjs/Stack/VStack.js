'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Stack = _interopRequireDefault(require("./Stack"));
var _utils = require("../internals/utils");
const Subcomponents = {
  Item: _Stack.default.Item
};
const VStack = (0, _utils.forwardRef)((props, ref) => {
  const {
    reverse,
    ...rest
  } = props;
  const direction = reverse ? 'column-reverse' : 'column';
  return /*#__PURE__*/_react.default.createElement(_Stack.default, (0, _extends2.default)({}, rest, {
    direction: direction,
    ref: ref
  }));
}, Subcomponents);
VStack.displayName = 'VStack';
var _default = exports.default = VStack;