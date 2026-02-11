'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 * The ButtonToolbar component is used to group a series of buttons together in a single line.
 * @see https://rsuitejs.com/components/button/#button-toolbar
 */
const ButtonToolbar = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('ButtonToolbar', props);
  const {
    as,
    className,
    classPrefix = 'btn-toolbar',
    role = 'toolbar',
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Stack.default, (0, _extends2.default)({
    wrap: true,
    spacing: 8,
    as: as,
    role: role,
    ref: ref,
    className: classes
  }, rest));
});
ButtonToolbar.displayName = 'ButtonToolbar';
var _default = exports.default = ButtonToolbar;