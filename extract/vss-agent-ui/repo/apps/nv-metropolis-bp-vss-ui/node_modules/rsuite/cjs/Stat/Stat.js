'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _StatLabel = _interopRequireDefault(require("./StatLabel"));
var _StatValue = _interopRequireDefault(require("./StatValue"));
var _StatValueUnit = _interopRequireDefault(require("./StatValueUnit"));
var _StatHelpText = _interopRequireDefault(require("./StatHelpText"));
var _StatTrend = _interopRequireDefault(require("./StatTrend"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Subcomponents = {
  Label: _StatLabel.default,
  Value: _StatValue.default,
  Trend: _StatTrend.default,
  ValueUnit: _StatValueUnit.default,
  HelpText: _StatHelpText.default
};
const Stat = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Stat', props);
  const {
    as,
    classPrefix = 'stat',
    className,
    children,
    bordered,
    icon,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    bordered
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    className: classes,
    ref: ref
  }, rest), icon && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('icon')
  }, icon), /*#__PURE__*/_react.default.createElement("dl", {
    className: prefix('body')
  }, children));
}, Subcomponents);
Stat.displayName = 'Stat';
var _default = exports.default = Stat;