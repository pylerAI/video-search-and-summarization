'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));
var _Whisper = _interopRequireDefault(require("../Whisper"));
var _Popover = _interopRequireDefault(require("../Popover"));
var _NavbarItem = _interopRequireDefault(require("./NavbarItem"));
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const NavbarMegaMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    as: Component = _NavbarItem.default,
    className,
    classPrefix = 'mega-menu',
    children,
    title,
    open,
    placement = 'autoVertical',
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const renderMenu = (0, _react.useCallback)((menuProps, ref) => {
    const {
      onClose,
      className
    } = menuProps || {};
    return /*#__PURE__*/_react.default.createElement(_Popover.default, {
      ref: ref,
      full: true,
      arrow: false,
      className: className
    }, typeof children === 'function' ? children({
      onClose
    }) : children);
  }, [children]);
  return /*#__PURE__*/_react.default.createElement(_Whisper.default, {
    preventOverflow: true,
    placement: placement,
    trigger: "click",
    speaker: renderMenu,
    open: open
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    className: classes
  }, rest), title, /*#__PURE__*/_react.default.createElement(_ArrowDownLine.default, {
    className: prefix`toggle-icon`
  })));
});
NavbarMegaMenu.displayName = 'NavbarMegaMenu';
var _default = exports.default = NavbarMegaMenu;