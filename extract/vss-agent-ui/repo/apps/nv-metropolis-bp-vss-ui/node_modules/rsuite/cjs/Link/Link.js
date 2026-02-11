'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _ExternalLinkIcon = _interopRequireDefault(require("./ExternalLinkIcon"));
const Link = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Link', props);
  const {
    as,
    anchorIcon,
    classPrefix = 'link',
    className,
    children,
    disabled,
    underline,
    showAnchorIcon,
    external,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const icon = anchorIcon || /*#__PURE__*/_react.default.createElement(_ExternalLinkIcon.default, {
    className: prefix('icon')
  });
  return /*#__PURE__*/_react.default.createElement(_SafeAnchor.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    role: "link",
    className: classes,
    disabled: disabled,
    target: external ? '_blank' : undefined,
    rel: external ? 'noopener noreferrer' : undefined,
    "data-underline": underline,
    "data-disabled": disabled
  }, rest), children, showAnchorIcon && icon);
});
Link.displayName = 'Link';
var _default = exports.default = Link;