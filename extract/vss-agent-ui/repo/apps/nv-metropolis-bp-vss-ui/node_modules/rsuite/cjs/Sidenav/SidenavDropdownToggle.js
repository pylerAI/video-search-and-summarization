'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ArrowRightLine = _interopRequireDefault(require("@rsuite/icons/ArrowRightLine"));
var _SidenavItem = _interopRequireDefault(require("./SidenavItem"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> call
 *
 * <Nav>
 *   <Nav.Menu> -> This will render <NavDropdown> component that renders a <NavDropdownToggle>
 *   </Nav.Menu>
 * </Nav>
 */
const SidenavDropdownToggle = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = _SidenavItem.default,
    classPrefix = 'sidenav-dropdown-toggle',
    className,
    renderToggle,
    children,
    noCaret,
    ...rest
  } = props;
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const toggle = /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    className: classes,
    ref: ref,
    tooltip: children
  }, rest), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('title')
  }, children), !noCaret && /*#__PURE__*/_react.default.createElement(_ArrowRightLine.default, {
    className: prefix('caret')
  }));
  return renderToggle ? renderToggle(rest, ref) : toggle;
});
SidenavDropdownToggle.displayName = 'Sidenav.Dropdown.Toggle';
var _default = exports.default = SidenavDropdownToggle;