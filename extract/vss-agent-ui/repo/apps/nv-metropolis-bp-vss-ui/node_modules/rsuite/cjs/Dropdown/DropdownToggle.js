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
const DropdownToggle = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = _Button.default,
    className,
    classPrefix = 'dropdown-toggle',
    renderToggle,
    children,
    icon,
    noCaret,
    placement = 'bottomStart',
    ...rest
  } = props;
  const {
    prefix,
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    'no-caret': noCaret
  }));

  // Caret icon is down by default, when Dropdown is used in Sidenav.
  const Caret = (0, _hooks.useToggleCaret)(placement);
  const toggle = /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
    className: prefix('icon')
  }), children, noCaret ? null : /*#__PURE__*/_react.default.createElement(Caret, {
    className: prefix('caret')
  }));
  return renderToggle ? renderToggle(rest, ref) : toggle;
});
DropdownToggle.displayName = 'DropdownToggle';
var _default = exports.default = DropdownToggle;