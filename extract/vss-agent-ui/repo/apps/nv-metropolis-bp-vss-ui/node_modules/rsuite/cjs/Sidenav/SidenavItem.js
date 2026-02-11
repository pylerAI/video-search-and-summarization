'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Whisper = _interopRequireDefault(require("../Whisper"));
var _Tooltip = _interopRequireDefault(require("../Tooltip"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _SidenavContext = require("./SidenavContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props of SidenavItem component
 */

/**
 * @private
 */
const SidenavItem = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  if (!sidenav) {
    throw new Error('<SidenavItem> component is not supposed to be used standalone. Use <Nav.Item> inside <Sidenav> instead.');
  }
  const {
    as = _SafeAnchor.default,
    active: activeProp,
    classPrefix = 'sidenav-item',
    children,
    className,
    disabled,
    divider,
    eventKey,
    icon,
    panel,
    style,
    tooltip = children,
    onClick,
    onSelect,
    ...rest
  } = props;
  const {
    activeKey,
    onSelect: onSelectFromNav
  } = (0, _react.useContext)(_NavContext.default);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const selected = activeProp !== null && activeProp !== void 0 ? activeProp : !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(activeKey, eventKey);
  const whisperRef = _react.default.useRef(null);
  const handleClick = (0, _react.useCallback)(event => {
    var _whisperRef$current;
    if (disabled) return;
    (_whisperRef$current = whisperRef.current) === null || _whisperRef$current === void 0 || _whisperRef$current.close();
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    onSelectFromNav === null || onSelectFromNav === void 0 || onSelectFromNav(eventKey, event);
    onClick === null || onClick === void 0 || onClick(event);
  }, [disabled, onSelect, onSelectFromNav, eventKey, onClick]);
  const clonedIcon = icon ? /*#__PURE__*/_react.default.cloneElement(icon, {
    className: (0, _classnames.default)(prefix('icon'), icon.props.className)
  }) : null;
  const title = typeof children === 'string' ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('title')
  }, children) : children;
  if (!sidenav.expanded) {
    if (panel || divider) {
      return null;
    }
    return /*#__PURE__*/_react.default.createElement(_Whisper.default, {
      trigger: "hover",
      speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, null, tooltip),
      placement: "right",
      ref: whisperRef
    }, (triggerProps, triggerRef) => /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
      selected: selected,
      disabled: disabled,
      onActivate: handleClick
    }, ({
      selected,
      active,
      ...menuitem
    }, menuitemRef) => {
      const classes = merge(className, withPrefix());

      // Show tooltip when inside a collapse <Sidenav>
      return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
        as: as,
        ref: (0, _utils.mergeRefs)((0, _utils.mergeRefs)(ref, menuitemRef), triggerRef),
        disabled: as === _SafeAnchor.default ? disabled : undefined,
        className: classes,
        "data-active": selected,
        "data-disabled": disabled,
        "data-focus": active,
        "data-event-key": eventKey
      }, (0, _omit.default)(rest, ['divider', 'panel']), triggerProps, menuitem, {
        onMouseOver: (0, _utils.createChainedFunction)(menuitem.onMouseOver, triggerProps.onMouseOver),
        onMouseOut: (0, _utils.createChainedFunction)(menuitem.onMouseOut, triggerProps.onMouseOut)
      }), clonedIcon, title);
    }));
  }
  if (divider) {
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
      ref: ref,
      role: "separator",
      style: style,
      className: merge(className, prefix('divider'))
    }, rest));
  }
  if (panel) {
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
      ref: ref,
      role: "none presentation",
      style: style,
      className: merge(className, prefix('panel'))
    }, rest), children);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: merge(className, withPrefix()),
    onClick: handleClick,
    style: style,
    "aria-selected": selected || undefined,
    "data-active": selected,
    "data-disabled": disabled,
    "data-event-key": eventKey
  }, rest), clonedIcon, title);
});
SidenavItem.displayName = 'Sidenav.Item';
var _default = exports.default = SidenavItem;