'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _Ripple = _interopRequireDefault(require("../internals/Ripple"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private
 */
const NavbarItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = _SafeAnchor.default,
    active: activeProp,
    disabled,
    eventKey,
    className,
    classPrefix = 'navbar-item',
    style,
    children,
    icon,
    onClick,
    onSelect: onSelectProp,
    ...rest
  } = props;
  const {
    activeKey,
    onSelect: onSelectFromNav
  } = (0, _react.useContext)(_NavContext.default);
  const active = activeProp !== null && activeProp !== void 0 ? activeProp : !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(eventKey, activeKey);
  const emitSelect = (0, _react.useCallback)(event => {
    onSelectProp === null || onSelectProp === void 0 || onSelectProp(eventKey, event);
    onSelectFromNav === null || onSelectFromNav === void 0 || onSelectFromNav(eventKey, event);
  }, [eventKey, onSelectProp, onSelectFromNav]);
  const {
    prefix,
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const handleClick = (0, _react.useCallback)(event => {
    if (!disabled) {
      emitSelect(event);
      onClick === null || onClick === void 0 || onClick(event);
    }
  }, [disabled, emitSelect, onClick]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    "aria-selected": active || undefined,
    "data-active": active,
    "data-disabled": disabled
  }, rest, {
    className: classes,
    onClick: handleClick,
    style: style
  }), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
    className: (0, _classnames.default)(prefix('icon'), icon.props.className)
  }), children, /*#__PURE__*/_react.default.createElement(_Ripple.default, null));
});
NavbarItem.displayName = 'Navbar.Item';
var _default = exports.default = NavbarItem;