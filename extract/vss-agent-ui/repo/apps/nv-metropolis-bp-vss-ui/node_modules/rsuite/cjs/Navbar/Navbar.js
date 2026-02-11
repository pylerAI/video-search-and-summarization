'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _NavbarBrand = _interopRequireDefault(require("./NavbarBrand"));
var _NavbarContent = _interopRequireDefault(require("./NavbarContent"));
var _NavbarToggle = _interopRequireDefault(require("./NavbarToggle"));
var _NavbarDrawer = _interopRequireDefault(require("./NavbarDrawer"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _NavbarContext = require("./NavbarContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Brand: _NavbarBrand.default,
  Content: _NavbarContent.default,
  Toggle: _NavbarToggle.default,
  Drawer: _NavbarDrawer.default
};

/**
 * The `Navbar` component is a wrapper that positions navigation elements.
 * @see https://rsuitejs.com/components/navbar
 */
const Navbar = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Navbar', props);
  const {
    className,
    as = 'nav',
    classPrefix = 'navbar',
    appearance = 'default',
    drawerOpen,
    onDrawerOpenChange,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [open, setOpen] = (0, _hooks.useControlled)(drawerOpen, false);
  const handleToggle = (0, _hooks.useEventCallback)(nextOpen => {
    setOpen(nextOpen);
    onDrawerOpenChange === null || onDrawerOpenChange === void 0 || onDrawerOpenChange(nextOpen);
  });
  const navbarId = (0, _hooks.useUniqueId)('navbar-');
  const context = (0, _react.useMemo)(() => ({
    appearance,
    open,
    navbarId,
    onToggle: handleToggle
  }), [appearance, navbarId, open]);
  return /*#__PURE__*/_react.default.createElement(_NavbarContext.NavbarContext.Provider, {
    value: context
  }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-appearance": appearance
  }, rest)));
}, Subcomponents);
Navbar.displayName = 'Navbar';
var _default = exports.default = Navbar;