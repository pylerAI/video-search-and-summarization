'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));
var _IconButton = _interopRequireDefault(require("../../IconButton"));
var _utils = require("../utils");
var _hooks = require("../hooks");
/**
 * Close button for components such as Message and Notification.
 */
const CloseButton = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'button',
    classPrefix = 'btn-close',
    className,
    locale: overrideLocale,
    ...rest
  } = props;
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    closeLabel
  } = getLocale('CloseButton', overrideLocale);
  const classes = merge(className, withPrefix());
  if (Component === _IconButton.default) {
    return /*#__PURE__*/_react.default.createElement(_IconButton.default, (0, _extends2.default)({
      icon: /*#__PURE__*/_react.default.createElement(_Close.default, null),
      ref: ref,
      className: classes,
      "aria-label": closeLabel,
      appearance: "subtle",
      size: "sm"
    }, rest));
  }
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    type: "button",
    ref: ref,
    className: classes,
    "aria-label": closeLabel
  }, rest), /*#__PURE__*/_react.default.createElement(_Close.default, null));
});
CloseButton.displayName = 'CloseButton';
var _default = exports.default = CloseButton;