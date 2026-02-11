'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Menu = _interopRequireDefault(require("../internals/Menu/Menu"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _Menubar = _interopRequireDefault(require("../internals/Menu/Menubar"));
var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/PagePrevious"));
var _PageNext = _interopRequireDefault(require("@rsuite/icons/PageNext"));
var _DropdownContext = _interopRequireDefault(require("./DropdownContext"));
var _Nav = _interopRequireDefault(require("../Nav"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `<Dropdown.Menu>` API
 *
 * @description
 * Note the difference between this component and `<Menu>` component:
 * `<Menu>` is used for ARIA menu control logic and is used internally only.
 * This component is only used for supporting submenu syntax and is
 * assigned to Dropdown.Menu
 *
 * @example
 *
 * <Dropdown>
 *   <Dropdown.Item>Item 1</Dropdown.Item>
 *   <Dropdown.Menu title="Submenu">
 *     <Dropdown.Item>Sub item</Dropdown.Item>
 *   </Dropdown.Menu>
 * </Dropdown>
 */
const DropdownMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    activeKey,
    classPrefix = 'dropdown-menu',
    className,
    children,
    eventKey,
    title,
    onSelect,
    onToggle,
    ...rest
  } = props;
  const nav = (0, _react.useContext)(_NavContext.default);
  const dropdown = (0, _react.useContext)(_DropdownContext.default);
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const handleToggleSubmenu = (0, _react.useCallback)((_, event) => {
    onToggle === null || onToggle === void 0 || onToggle(eventKey, event);
  }, [eventKey, onToggle]);
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  const {
    merge: mergeItemClassNames,
    withPrefix: withItemClassPrefix,
    prefix: prefixItemClassName
  } = (0, _hooks.useStyles)('dropdown-item');
  const contextValue = (0, _react.useMemo)(() => ({
    activeKey,
    onSelect
  }), [activeKey, onSelect]);

  // If rendered within a <Nav>
  // Suggest <Nav.Menu>
  if (nav) {
    (0, _utils.warnOnce)('Usage of <Dropdown.Menu> within <Nav> is deprecated. Replace with <Nav.Menu>');
    return /*#__PURE__*/_react.default.createElement(_Nav.default.Menu, (0, _extends2.default)({
      ref: ref
    }, props));
  }

  // <Dropdown.Menu> is used outside of <Dropdown>
  // renders a vertical `menubar`
  if (!dropdown) {
    const classes = merge(className, withPrefix());
    return /*#__PURE__*/_react.default.createElement(_DropdownContext.default.Provider, {
      value: contextValue
    }, /*#__PURE__*/_react.default.createElement(_Menubar.default, {
      vertical: true
    }, (menubar, menubarRef) => /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(menubarRef, ref),
      className: classes
    }, menubar, rest), children)));
  }

  // Parent menu exists. This is a submenu.
  // Should render a `menuitem` that controls this submenu.
  const {
    icon,
    disabled,
    ...menuProps
  } = (0, _omit.default)(rest, ['trigger']);
  const Icon = rtl ? _PagePrevious.default : _PageNext.default;
  return /*#__PURE__*/_react.default.createElement(_Menu.default, {
    openMenuOn: ['mouseover', 'click'],
    renderMenuButton: ({
      open,
      ...menuButtonProps
    }, buttonRef) => /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
      disabled: disabled
    }, ({
      selected,
      active,
      ...menuitem
    }, menuitemRef) => {
      const classes = mergeItemClassNames(className, prefixItemClassName`toggle`, withItemClassPrefix());
      return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
        ref: (0, _utils.mergeRefs)(buttonRef, menuitemRef),
        className: classes,
        "data-open": open,
        "data-disabled": disabled,
        "data-focus": active,
        "data-active": selected,
        "data-with-icon": icon,
        "data-event-key": eventKey,
        "data-event-key-type": typeof eventKey
      }, menuitem, (0, _omit.default)(menuButtonProps, ['role'])), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
        className: prefix('menu-icon')
      }), title, /*#__PURE__*/_react.default.createElement(Icon, {
        className: prefix`toggle-icon`
      }));
    }),
    renderMenuPopup: ({
      open,
      ...popupProps
    }, popupRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
      return /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
        ref: popupRef,
        className: menuClassName,
        hidden: !open
      }, popupProps, menuProps), children);
    },
    onToggleMenu: handleToggleSubmenu
  }, ({
    open,
    ...menuContainer
  }, menuContainerRef) => {
    const classes = mergeItemClassNames(className, withItemClassPrefix({
      submenu: true
    }));
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(ref, menuContainerRef),
      className: classes,
      "data-open": open,
      "data-disabled": disabled
    }, menuContainer));
  });
});
DropdownMenu.displayName = 'Dropdown.Menu';
var _default = exports.default = DropdownMenu;