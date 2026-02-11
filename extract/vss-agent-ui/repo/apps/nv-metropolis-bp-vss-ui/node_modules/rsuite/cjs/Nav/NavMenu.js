'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.NavMenuContext = exports.NavMenuActionType = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _NavDropdown = _interopRequireDefault(require("./NavDropdown"));
var _NavDropdownMenu = _interopRequireDefault(require("./NavDropdownMenu"));
var _NavbarDropdown = _interopRequireDefault(require("../Navbar/NavbarDropdown"));
var _NavbarDropdownMenu = _interopRequireDefault(require("../Navbar/NavbarDropdownMenu"));
var _SidenavDropdown = _interopRequireDefault(require("../Sidenav/SidenavDropdown"));
var _Navbar = require("../Navbar");
var _SidenavContext = require("../Sidenav/SidenavContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const NavMenuContext = exports.NavMenuContext = /*#__PURE__*/_react.default.createContext(null);
NavMenuContext.displayName = 'NavMenu.Context';
let NavMenuActionType = exports.NavMenuActionType = /*#__PURE__*/function (NavMenuActionType) {
  NavMenuActionType[NavMenuActionType["RegisterItem"] = 0] = "RegisterItem";
  NavMenuActionType[NavMenuActionType["UnregisterItem"] = 1] = "UnregisterItem";
  return NavMenuActionType;
}({});
const initilNavMenuState = {
  items: []
};
const reducer = (state, action) => {
  switch (action.type) {
    case NavMenuActionType.RegisterItem:
      return {
        ...state,
        items: [...state.items.filter(item => item._id !== action.payload._id), action.payload]
      };
    case NavMenuActionType.UnregisterItem:
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload._id)
      };
    default:
      throw new Error('Unrecognizable action type: ' + action.type);
  }
};

/**
 * The `Nav.Menu` component is used to create navigation menus.
 *
 * - When used as direct child of `<Nav>`, render the NavDropdown
 * - When used within another `<Nav.Menu>`, render the NavDropdownMenu
 *
 * @see https://rsuitejs.com/components/nav
 */
const NavMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const parentNavMenu = (0, _react.useContext)(NavMenuContext);
  const navMenuContext = (0, _react.useReducer)(reducer, initilNavMenuState);
  const navbar = (0, _react.useContext)(_Navbar.NavbarContext);
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  if (!parentNavMenu) {
    if (sidenav) {
      return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
        value: navMenuContext
      }, /*#__PURE__*/_react.default.createElement(_SidenavDropdown.default, (0, _extends2.default)({
        ref: ref
      }, props)));
    }
    if (navbar) {
      return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
        value: navMenuContext
      }, /*#__PURE__*/_react.default.createElement(_NavbarDropdown.default, (0, _extends2.default)({
        ref: ref
      }, props)));
    }
    return /*#__PURE__*/_react.default.createElement(NavMenuContext.Provider, {
      value: navMenuContext
    }, /*#__PURE__*/_react.default.createElement(_NavDropdown.default, (0, _extends2.default)({
      ref: ref
    }, props)));
  }
  if (navbar) {
    return /*#__PURE__*/_react.default.createElement(_NavbarDropdownMenu.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  return /*#__PURE__*/_react.default.createElement(_NavDropdownMenu.default, (0, _extends2.default)({
    ref: ref
  }, props));
});
NavMenu.displayName = 'Nav.Menu';
var _default = exports.default = NavMenu;