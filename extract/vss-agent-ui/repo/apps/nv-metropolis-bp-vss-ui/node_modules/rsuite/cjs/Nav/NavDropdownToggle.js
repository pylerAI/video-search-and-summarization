'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));
var _NavItem = _interopRequireDefault(require("./NavItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> call
 *
 * <Nav>
 *   <Nav.Menu> -> This will render <NavDropdown> component that renders a <NavDropdownToggle>
 *   </Nav.Menu>
 * </Nav>
 */
const NavDropdownToggle = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = _NavItem.default,
    className,
    classPrefix = 'dropdown-toggle',
    renderToggle,
    children,
    noCaret,
    ...rest
  } = props;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    prefix: prefixNavItem
  } = (0, _hooks.useStyles)('nav-item');
  const classes = merge(className, withPrefix({
    'no-caret': noCaret
  }));
  const toggle = /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: ref,
    className: classes
  }), children, !noCaret && /*#__PURE__*/_react.default.createElement(_ArrowDownLine.default, {
    className: prefixNavItem('caret')
  }));
  return renderToggle ? renderToggle(rest, ref) : toggle;
});
NavDropdownToggle.displayName = 'Nav.Dropdown.Toggle';
var _default = exports.default = NavDropdownToggle;