'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _Text = _interopRequireDefault(require("../Text"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const PasswordStrengthMeter = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('PasswordStrengthMeter', props);
  const {
    classPrefix = 'password-strength-meter',
    className,
    level = 0,
    max = 4,
    label,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    ref: ref,
    className: classes
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('bar')
  }, [...Array.from({
    length: max
  })].map((_, idx) => /*#__PURE__*/_react.default.createElement("div", {
    key: idx,
    "data-active": idx <= level,
    className: prefix('segment')
  }))), label && /*#__PURE__*/_react.default.createElement(_Text.default, {
    as: "span",
    muted: true,
    size: "xs"
  }, label));
});
PasswordStrengthMeter.displayName = 'PasswordStrengthMeter';
var _default = exports.default = PasswordStrengthMeter;