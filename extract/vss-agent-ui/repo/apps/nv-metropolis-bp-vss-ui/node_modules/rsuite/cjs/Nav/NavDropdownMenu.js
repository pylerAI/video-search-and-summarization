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
var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/PagePrevious"));
var _PageNext = _interopRequireDefault(require("@rsuite/icons/PageNext"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private
 */
const NavDropdownMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!nav) {
    throw new Error('<Nav.Dropdown.Menu> should be used within a <Nav> component.');
  }
  const {
    onToggle,
    eventKey,
    title,
    classPrefix = 'dropdown-menu',
    children,
    openDirection = 'end',
    noCaret,
    ...rest
  } = props;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const handleToggleSubmenu = (0, _react.useCallback)((open, event) => {
    onToggle === null || onToggle === void 0 || onToggle(open, eventKey, event);
  }, [eventKey, onToggle]);
  const {
    prefix
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

  // Parent menu exists. This is a submenu.
  // Should render a `menuitem` that controls this submenu.
  const {
    icon,
    className,
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
        "data-focus": active,
        "data-active": selected,
        "data-disabled": disabled,
        "data-with-icon": icon,
        "data-event-key": eventKey,
        "data-event-key-type": typeof eventKey
      }, menuitem, (0, _omit.default)(menuButtonProps, ['role'])), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
        className: prefix('menu-icon')
      }), title, !noCaret && /*#__PURE__*/_react.default.createElement(Icon, {
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
        hidden: !open,
        "data-direction": openDirection
      }, popupProps, menuProps), children);
    },
    onToggleMenu: handleToggleSubmenu
  }, ({
    open,
    ...menuContainer
  }, menuContainerRef) => {
    const classes = mergeItemClassNames(className, withItemClassPrefix('submenu'));
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(ref, menuContainerRef),
      className: classes,
      "data-open": open,
      "data-disabled": disabled
    }, menuContainer));
  });
});
NavDropdownMenu.displayName = 'Nav.Dropdown.Menu';
var _default = exports.default = NavDropdownMenu;