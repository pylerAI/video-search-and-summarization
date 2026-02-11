'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _castArray = _interopRequireDefault(require("lodash/castArray"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Disclosure = _interopRequireDefault(require("../internals/Disclosure/Disclosure"));
var _NavDropdownItem = _interopRequireDefault(require("../Nav/NavDropdownItem"));
var _NavDropdownMenu = _interopRequireDefault(require("../Nav/NavDropdownMenu"));
var _NavbarDropdownToggle = _interopRequireDefault(require("./NavbarDropdownToggle"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _NavbarContext = require("./NavbarContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _NavDropdownItem.default,
  Menu: _NavDropdownMenu.default
};

/**
 * @private
 */
const NavbarDropdown = (0, _utils.forwardRef)((props, ref) => {
  const navbar = (0, _react.useContext)(_NavbarContext.NavbarContext);
  if (!navbar) {
    throw new Error('<Navbar.Dropdown> should be used within a <Navbar> component.');
  }
  const {
    as,
    title,
    onClose,
    onOpen,
    onToggle,
    trigger = 'click',
    placement = 'bottomStart',
    toggleAs,
    toggleClassName,
    classPrefix = 'dropdown',
    className,
    disabled,
    children,
    menuStyle,
    style,
    ...toggleProps
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  return /*#__PURE__*/_react.default.createElement(_Disclosure.default, {
    trigger: (0, _castArray.default)(trigger),
    hideOnClickOutside: true,
    onToggle: open => {
      onToggle === null || onToggle === void 0 || onToggle(open);
      if (open) {
        onOpen === null || onOpen === void 0 || onOpen();
      } else {
        onClose === null || onClose === void 0 || onClose();
      }
    }
  }, ({
    open,
    ...props
  }, containerRef) => {
    const classes = merge(className, withPrefix());
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: (0, _utils.mergeRefs)(ref, containerRef),
      className: classes,
      style: style,
      "data-open": open,
      "data-disabled": disabled,
      "data-placement": (0, _utils.kebabPlace)(placement)
    }, props), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Button, null, (buttonProps, buttonRef) => /*#__PURE__*/_react.default.createElement(_NavbarDropdownToggle.default, (0, _extends2.default)({
      ref: buttonRef,
      as: toggleAs,
      className: toggleClassName,
      placement: placement,
      disabled: disabled
    }, (0, _omit.default)(buttonProps, ['open']), toggleProps), title)), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Content, null, ({
      open
    }, elementRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
      return /*#__PURE__*/_react.default.createElement("ul", {
        ref: elementRef,
        className: menuClassName,
        style: menuStyle,
        hidden: !open
      }, children);
    }));
  });
}, Subcomponents);
NavbarDropdown.displayName = 'Navbar.Dropdown';
var _default = exports.default = NavbarDropdown;