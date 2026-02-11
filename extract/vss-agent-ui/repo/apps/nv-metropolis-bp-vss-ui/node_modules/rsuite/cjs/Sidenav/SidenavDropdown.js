'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _SidenavDropdownToggle = _interopRequireDefault(require("./SidenavDropdownToggle"));
var _Menu = _interopRequireDefault(require("../internals/Menu/Menu"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _ExpandedSidenavDropdown = _interopRequireDefault(require("./ExpandedSidenavDropdown"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _NavDropdownItem = _interopRequireDefault(require("../Nav/NavDropdownItem"));
var _NavDropdownMenu = _interopRequireDefault(require("../Nav/NavDropdownMenu"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _NavMenu = require("../Nav/NavMenu");
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _SidenavContext = require("./SidenavContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _NavDropdownItem.default,
  Menu: _NavDropdownMenu.default
};

/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> within a <Sidenav>
 *
 * <Sidenav>
 *   <Nav>
 *     <Nav.Menu> -> This submenu will render <SidenavDropdown> component
 *     </Nav.Menu>
 *   </Nav>
 * </Sidenav>
 */
const SidenavDropdown = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  const navMenu = (0, _react.useContext)(_NavMenu.NavMenuContext);
  if (!sidenav || !nav || !navMenu) {
    throw new Error('<Sidenav.Dropdown> must be rendered within a <Nav> component within a <Sidenav> component.');
  }
  const {
    as,
    title,
    eventKey,
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
    onClose,
    onOpen,
    onToggle,
    ...toggleProps
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  const {
    withPrefix: withNavItemClassPrefix,
    merge: mergeNavItemClassNames
  } = (0, _hooks.useStyles)('nav-item');
  const [{
    items
  }] = navMenu;
  const hasSelectedItems =
  // has items that is active indicated by <Nav activeKey>
  nav.activeKey && items.some(item => item.eventKey === nav.activeKey) ||
  // has items that is active indicated by <Nav.Item active>
  items.some(item => item.active);
  const menuButtonTriggers = (0, _react.useMemo)(() => {
    if (!trigger) {
      return undefined;
    }
    const triggerMap = {
      hover: 'mouseover',
      click: 'click',
      contextMenu: 'contextmenu'
    };
    if (!Array.isArray(trigger)) {
      return [triggerMap[trigger]];
    }
    return trigger.map(t => triggerMap[t]);
  }, [trigger]);

  // Render a disclosure when inside expanded <Sidenav>
  if (sidenav.expanded) {
    return /*#__PURE__*/_react.default.createElement(_ExpandedSidenavDropdown.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  const renderMenuButton = (menuButtonProps, buttonRef) => /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
    disabled: disabled
  }, ({
    active,
    ...menuitemProps
  }, menuitemRef) => {
    return /*#__PURE__*/_react.default.createElement(_SidenavDropdownToggle.default, (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(buttonRef, menuitemRef),
      as: toggleAs,
      className: mergeNavItemClassNames(toggleClassName, withNavItemClassPrefix({
        focus: active
      }))
    }, menuButtonProps, (0, _omit.default)(menuitemProps, ['onClick']), (0, _omit.default)(toggleProps, 'data-testid')), title);
  });
  return /*#__PURE__*/_react.default.createElement(_Menu.default, {
    menuButtonText: title,
    renderMenuButton: renderMenuButton,
    openMenuOn: menuButtonTriggers,
    renderMenuPopup: ({
      open,
      ...popupProps
    }, popupRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix({}));
      // When inside a collapsed <Sidenav>, render a header in menu
      const showHeader = !!sidenav;
      return /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
        ref: popupRef,
        className: menuClassName,
        style: menuStyle,
        hidden: !open
      }, popupProps), showHeader && /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('header')
      }, title), children);
    },
    onToggleMenu: (open, event) => {
      onToggle === null || onToggle === void 0 || onToggle(open, eventKey, event);
      sidenav === null || sidenav === void 0 || sidenav.onOpenChange(eventKey, event);
      if (open) {
        onOpen === null || onOpen === void 0 || onOpen();
      } else {
        onClose === null || onClose === void 0 || onClose();
      }
    }
  }, ({
    open,
    ...menuContainer
  }, menuContainerRef) => {
    const classes = merge(className, withPrefix('submenu'));
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: (0, _utils.mergeRefs)(ref, menuContainerRef),
      className: classes,
      style: style,
      "data-open": open,
      "data-disabled": disabled,
      "data-placement": (0, _utils.kebabPlace)(placement),
      "data-active-descendant": hasSelectedItems
    }, menuContainer, (0, _pick.default)(toggleProps, ['data-testid'])));
  });
}, Subcomponents);
SidenavDropdown.displayName = 'Sidenav.Dropdown';
var _default = exports.default = SidenavDropdown;