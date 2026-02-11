'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _NavbarMegaMenu = _interopRequireDefault(require("../Navbar/NavbarMegaMenu"));
var _Navbar = require("../Navbar");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Nav.MegaMenu` component is used to create a mega menu.
 * @see https://rsuitejs.com/components/navbar/#mega-menu
 * @version 6.0.0
 */
const NavMegaMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  if (!navbar) {
    console.error('<Nav.MegaMenu> should be used within a <Navbar> component. Use https://rsuitejs.com/components/navbar/#mega-menu for more information.');
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(_NavbarMegaMenu.default, (0, _extends2.default)({
    ref: ref
  }, props));
});
NavMegaMenu.displayName = 'NavMegaMenu';
var _default = exports.default = NavMegaMenu;