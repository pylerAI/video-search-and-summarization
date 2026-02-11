'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _SidenavDropdownCollapse = _interopRequireDefault(require("./SidenavDropdownCollapse"));
var _Disclosure = _interopRequireDefault(require("../internals/Disclosure/Disclosure"));
var _SidenavDropdownToggle = _interopRequireDefault(require("./SidenavDropdownToggle"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _SidenavContext = require("./SidenavContext");
var _NavMenu = require("../Nav/NavMenu");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ExpandedSidenavDropdown = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  const navMenu = (0, _react.useContext)(_NavMenu.NavMenuContext);
  if (!sidenav || !nav || !navMenu) {
    throw new Error('<SidenavDropdown> component is not supposed to be used standalone. Use <Nav.Menu> inside <Sidenav> instead.');
  }
  const {
    as,
    title,
    children,
    className,
    menuStyle,
    disabled,
    classPrefix = 'dropdown',
    placement = 'bottomStart',
    toggleClassName,
    icon,
    eventKey,
    toggleAs,
    noCaret,
    style,
    open: openProp,
    renderToggle,
    onOpen,
    onClose,
    onToggle,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const internalId = (0, _hooks.useInternalId)('SidenavDropdown');
  const uniqueKey = eventKey !== null && eventKey !== void 0 ? eventKey : internalId;
  const {
    openKeys = [],
    onOpenChange
  } = sidenav;
  const [{
    items
  }] = navMenu;
  const hasSelectedItems =
  // has items that is active indicated by <Nav activeKey>
  nav.activeKey && items.some(item => item.eventKey === nav.activeKey) ||
  // has items that is active indicated by <Nav.Item active>
  items.some(item => item.active);
  const handleToggleDisclosure = (0, _react.useCallback)((open, event) => {
    if (open) {
      onClose === null || onClose === void 0 || onClose();
    } else {
      onOpen === null || onOpen === void 0 || onOpen();
    }
    onToggle === null || onToggle === void 0 || onToggle(open);
    onOpenChange === null || onOpenChange === void 0 || onOpenChange(uniqueKey, event);
  }, [onClose, onOpen, onToggle, uniqueKey, onOpenChange]);
  const open = openProp !== null && openProp !== void 0 ? openProp : openKeys.includes(uniqueKey);
  return /*#__PURE__*/_react.default.createElement(_Disclosure.default, {
    open: open,
    onToggle: handleToggleDisclosure
  }, ({
    open
  }, containerRef) => {
    const classes = merge(className, withPrefix());
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: (0, _utils.mergeRefs)(ref, containerRef),
      style: style,
      className: classes,
      "data-event-key": eventKey,
      "data-expanded": open,
      "data-placement": (0, _utils.kebabPlace)(placement),
      "data-active-descendant": hasSelectedItems
    }, rest), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Button, null, (buttonProps, buttonRef) => /*#__PURE__*/_react.default.createElement(_SidenavDropdownToggle.default, (0, _extends2.default)({
      ref: buttonRef,
      as: toggleAs,
      noCaret: noCaret,
      className: toggleClassName,
      renderToggle: renderToggle,
      disabled: disabled,
      icon: icon,
      placement: placement
    }, (0, _omit.default)(buttonProps, ['open'])), title)), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Content, null, ({
      open
    }) => /*#__PURE__*/_react.default.createElement(_SidenavDropdownCollapse.default, {
      open: open,
      style: menuStyle
    }, children)));
  });
});
ExpandedSidenavDropdown.displayName = 'Sidenav.Dropdown';
var _default = exports.default = ExpandedSidenavDropdown;