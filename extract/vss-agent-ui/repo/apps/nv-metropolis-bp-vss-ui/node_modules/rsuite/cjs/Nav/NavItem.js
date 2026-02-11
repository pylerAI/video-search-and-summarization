'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _Ripple = _interopRequireDefault(require("../internals/Ripple"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Nav.Item` component is used to create navigation links.
 *
 * - When used as direct child of `<Nav>`, render the NavItem
 * - When used within a `<Nav.Menu>`, render the NavDropdownItem
 * @see https://rsuitejs.com/components/nav
 *
 */
const NavItem = (0, _utils.forwardRef)((props, ref) => {
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!nav) {
    throw new Error('<Nav.Item> must be rendered within a <Nav> component.');
  }
  const {
    as = _SafeAnchor.default,
    active: activeProp,
    disabled,
    eventKey,
    className,
    classPrefix = 'nav-item',
    style,
    children,
    icon,
    divider,
    panel,
    onClick,
    onSelect: onSelectProp,
    ...rest
  } = props;
  const {
    activeKey,
    onSelect: onSelectFromNav
  } = nav;
  const active = activeProp !== null && activeProp !== void 0 ? activeProp : !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(eventKey, activeKey);
  const emitSelect = (0, _react.useCallback)(event => {
    onSelectProp === null || onSelectProp === void 0 || onSelectProp(eventKey, event);
    onSelectFromNav === null || onSelectFromNav === void 0 || onSelectFromNav(eventKey, event);
  }, [eventKey, onSelectProp, onSelectFromNav]);
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const handleClick = (0, _react.useCallback)(event => {
    if (!disabled) {
      emitSelect(event);
      onClick === null || onClick === void 0 || onClick(event);
    }
  }, [disabled, emitSelect, onClick]);
  if (divider) {
    return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
      ref: ref,
      role: "separator",
      style: style,
      className: merge(className, prefix('divider'))
    }, rest));
  }
  if (panel) {
    return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
      ref: ref,
      style: style,
      className: merge(className, prefix('panel'))
    }, rest), children);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    tabIndex: disabled ? -1 : undefined,
    className: classes,
    onClick: handleClick,
    style: style,
    "aria-selected": active || undefined,
    "data-active": active || undefined,
    "data-disabled": disabled
  }, rest), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
    className: (0, _classnames.default)(prefix('icon'), icon.props.className)
  }), children, /*#__PURE__*/_react.default.createElement(_Ripple.default, null));
});
NavItem.displayName = 'Nav.Item';
var _default = exports.default = NavItem;