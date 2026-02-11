'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _Menubar = _interopRequireDefault(require("../internals/Menu/Menubar"));
var _NavDropdown = _interopRequireDefault(require("./NavDropdown"));
var _NavMenu = _interopRequireDefault(require("./NavMenu"));
var _NavMegaMenu = _interopRequireDefault(require("./NavMegaMenu"));
var _NavDropdownItem = _interopRequireDefault(require("./NavDropdownItem"));
var _NavDropdownMenu = _interopRequireDefault(require("./NavDropdownMenu"));
var _AdaptiveNavItem = _interopRequireDefault(require("./AdaptiveNavItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _NavbarContext = require("../Navbar/NavbarContext");
var _SidenavContext = require("../Sidenav/SidenavContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const DeprecatedNavDropdown = (0, _utils.deprecateComponent)(_NavDropdown.default, '<Nav.Dropdown> is deprecated, use <Nav.Menu> instead.');
DeprecatedNavDropdown.Menu = (0, _utils.deprecateComponent)(_NavDropdownMenu.default, '<Nav.Dropdown.Menu> is deprecated, use <Nav.Menu> instead');
DeprecatedNavDropdown.Item = (0, _utils.deprecateComponent)(_NavDropdownItem.default, '<Nav.Dropdown.Item> is deprecated, use <Nav.Item> instead');
const Subcomponents = {
  /**
   * @deprecated Use <Nav.Menu> instead.
   */
  Dropdown: DeprecatedNavDropdown,
  Item: _AdaptiveNavItem.default,
  Menu: _NavMenu.default,
  MegaMenu: _NavMegaMenu.default
};

/**
 * The `Nav` component is used to create navigation links.
 * @see https://rsuitejs.com/components/nav
 */
const Nav = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Nav', props);
  const {
    as,
    classPrefix = 'nav',
    appearance = 'default',
    vertical,
    justified,
    reversed,
    className,
    children,
    activeKey: activeKeyProp,
    defaultActiveKey,
    onSelect: onSelectProp,
    ...rest
  } = propsWithDefaults;
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);

  // Whether inside a <Navbar>
  const navbar = (0, _react.useContext)(_NavbarContext.NavbarContext);
  const menubarRef = (0, _hooks.useEnsuredRef)(ref);
  const {
    withPrefix,
    merge,
    rootPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, rootPrefix({
    'navbar-nav': navbar,
    'sidenav-nav': sidenav
  }), withPrefix());
  const dataAttributes = {
    'data-appearance': appearance,
    'data-reversed': reversed,
    'data-justified': justified,
    'data-direction': vertical || sidenav ? 'vertical' : 'horizontal'
  };
  const {
    activeKey: activeKeyFromSidenav,
    onSelect: onSelectFromSidenav
  } = sidenav || {};
  const [activeKey, setActiveKey] = (0, _hooks.useControlled)(activeKeyProp !== null && activeKeyProp !== void 0 ? activeKeyProp : activeKeyFromSidenav, defaultActiveKey);
  const contextValue = (0, _react.useMemo)(() => ({
    activeKey,
    onSelect: (eventKey, event) => {
      setActiveKey(eventKey);
      onSelectProp === null || onSelectProp === void 0 || onSelectProp(eventKey, event);
      onSelectFromSidenav === null || onSelectFromSidenav === void 0 || onSelectFromSidenav(eventKey, event);
    }
  }), [activeKey, onSelectFromSidenav, onSelectProp, setActiveKey]);
  if (sidenav !== null && sidenav !== void 0 && sidenav.expanded) {
    return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
      ref: ref,
      className: classes
    }, dataAttributes, rest), children));
  }
  const hasWaterline = appearance !== 'default';

  // If inside a collapsed <Sidenav>, render an ARIA `menubar` (vertical)
  if (sidenav) {
    return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement(_Menubar.default, {
      vertical: !!sidenav
    }, (menubar, ref) => /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: ref,
      className: classes
    }, dataAttributes, menubar, rest), children)));
  }
  return /*#__PURE__*/_react.default.createElement(_NavContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: menubarRef,
    className: classes
  }, dataAttributes, rest), children, hasWaterline && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('bar')
  })));
}, Subcomponents);
Nav.displayName = 'Nav';
var _default = exports.default = Nav;