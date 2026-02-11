'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _FormattedNumber = require("../internals/intl/FormattedNumber");
const StatValue = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'dd',
    classPrefix = 'stat-value',
    className,
    children,
    value,
    formatOptions,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), value && /*#__PURE__*/_react.default.createElement(_FormattedNumber.FormattedNumber, {
    value: value,
    formatOptions: formatOptions
  }), children);
});
StatValue.displayName = 'StatValue';
var _default = exports.default = StatValue;