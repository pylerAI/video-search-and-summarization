'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _InputGroup = _interopRequireDefault(require("../../InputGroup"));
const PickerLabel = ({
  children,
  className,
  as: Component = _InputGroup.default.Addon,
  ...rest
}) => {
  return children ? /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    "data-testid": "picker-label",
    className: className
  }, rest), children) : null;
};
var _default = exports.default = PickerLabel;