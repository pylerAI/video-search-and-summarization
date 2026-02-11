'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _NavItem = _interopRequireDefault(require("./NavItem"));
var _NavDropdownItem = _interopRequireDefault(require("./NavDropdownItem"));
var _NavbarDropdownItem = _interopRequireDefault(require("../Navbar/NavbarDropdownItem"));
var _NavbarItem = _interopRequireDefault(require("../Navbar/NavbarItem"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _SidenavDropdownItem = _interopRequireDefault(require("../Sidenav/SidenavDropdownItem"));
var _SidenavItem = _interopRequireDefault(require("../Sidenav/SidenavItem"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _NavbarContext = require("../Navbar/NavbarContext");
var _SidenavContext = require("../Sidenav/SidenavContext");
var _NavMenu = require("./NavMenu");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The <Nav.Item> API
 * When used as direct child of <Nav>, render the NavItem
 * When used within a <Nav.Menu>, render the NavDropdownItem
 */
const AdaptiveNavItem = (0, _utils.forwardRef)((props, ref) => {
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!nav) {
    throw new Error('<Nav.Item> must be rendered within a <Nav> component.');
  }
  const parentNavMenu = (0, _react.useContext)(_NavMenu.NavMenuContext);
  const navbar = (0, _react.useContext)(_NavbarContext.NavbarContext);
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  const [, dispatch] = parentNavMenu !== null && parentNavMenu !== void 0 ? parentNavMenu : [];
  const _id = (0, _hooks.useInternalId)('Nav.Item');
  (0, _react.useEffect)(() => {
    if (dispatch) {
      var _props$active;
      dispatch({
        type: _NavMenu.NavMenuActionType.RegisterItem,
        payload: {
          _id,
          eventKey: props.eventKey,
          active: (_props$active = props.active) !== null && _props$active !== void 0 ? _props$active : false
        }
      });
      return () => {
        dispatch({
          type: _NavMenu.NavMenuActionType.UnregisterItem,
          payload: {
            _id
          }
        });
      };
    }
  }, [dispatch, _id, props.eventKey, props.active]);
  if (parentNavMenu) {
    if (sidenav) {
      return /*#__PURE__*/_react.default.createElement(_SidenavDropdownItem.default, (0, _extends2.default)({
        ref: ref
      }, props));
    }
    if (navbar) {
      return /*#__PURE__*/_react.default.createElement(_NavbarDropdownItem.default, (0, _extends2.default)({
        ref: ref
      }, props));
    }
    return /*#__PURE__*/_react.default.createElement(_NavDropdownItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  if (sidenav) {
    return /*#__PURE__*/_react.default.createElement(_SidenavItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  if (navbar) {
    return /*#__PURE__*/_react.default.createElement(_NavbarItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  return /*#__PURE__*/_react.default.createElement(_NavItem.default, (0, _extends2.default)({
    ref: ref
  }, props));
});
AdaptiveNavItem.displayName = 'Nav.Item';
var _default = exports.default = AdaptiveNavItem;