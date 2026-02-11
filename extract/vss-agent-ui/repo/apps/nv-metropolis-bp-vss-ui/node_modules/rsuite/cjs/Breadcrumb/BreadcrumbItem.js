'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/Box/utils");
var _utils2 = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `<Breadcrumb.Item>` component is used to specify each section of the Breadcrumb.
 * @see https://rsuitejs.com/components/breadcrumb
 */
const BreadcrumbItem = (0, _utils2.forwardRef)((props, ref) => {
  const {
    wrapperAs: Wrapper = 'li',
    href,
    as: Component = href ? _SafeAnchor.default : 'span',
    classPrefix = 'breadcrumb-item',
    title,
    target,
    className,
    style,
    active,
    children,
    separator,
    icon,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());

  // Separate BoxProps for wrapper and other props for inner component
  const boxProps = (0, _utils.extractBoxProps)(rest);
  const componentProps = (0, _utils.omitBoxProps)(rest);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: Wrapper,
    style: style,
    className: classes,
    "data-active": active
  }, boxProps), icon, active ? /*#__PURE__*/_react.default.createElement("span", null, children) : /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    href: href,
    title: title,
    target: target
  }, componentProps), children), separator);
});
BreadcrumbItem.displayName = 'BreadcrumbItem';
var _default = exports.default = BreadcrumbItem;