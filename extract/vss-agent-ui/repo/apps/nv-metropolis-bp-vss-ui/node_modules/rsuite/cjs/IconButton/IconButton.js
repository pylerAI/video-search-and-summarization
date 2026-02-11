'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Button = _interopRequireDefault(require("../Button"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `IconButton` component is used to specify a button with icon.
 * @see https://rsuitejs.com/components/button
 */
const IconButton = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('IconButton', props);
  const {
    circle,
    children,
    className,
    classPrefix = 'btn-icon',
    placement = 'start',
    icon,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes,
    "data-shape": circle ? 'circle' : undefined,
    "data-placement": placement,
    "data-with-text": typeof children !== 'undefined' || undefined
  }), icon, children);
});
IconButton.displayName = 'IconButton';
var _default = exports.default = IconButton;