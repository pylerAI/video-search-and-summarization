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
const StatGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('StatGroup', props);
  const {
    as,
    classPrefix = 'stat-group',
    className,
    children,
    columns,
    spacing = 6,
    style,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const styles = (0, _utils.mergeStyles)(style, cssVar('columns', columns), cssVar('spacing', spacing, _utils.getCssValue));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles
  }, rest), children);
});
StatGroup.displayName = 'StatGroup';
var _default = exports.default = StatGroup;