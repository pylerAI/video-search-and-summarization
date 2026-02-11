'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Menubar = _interopRequireDefault(require("../internals/Menu/Menubar"));
var _MenuContext = _interopRequireDefault(require("./MenuContext"));
var _MenuItem = _interopRequireDefault(require("./MenuItem"));
var _MenuSeparator = _interopRequireDefault(require("./MenuSeparator"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _MenuItem.default,
  Separator: _MenuSeparator.default
};

/**
 * The `<Menu>` component is used to create a menu.
 *
 * @see https://rsuitejs.com/components/menu
 */
const Menu = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'ul',
    activeKey,
    classPrefix = 'menu',
    className,
    children,
    onSelect,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const contextValue = (0, _react.useMemo)(() => ({
    activeKey,
    onSelect
  }), [activeKey, onSelect]);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_MenuContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Menubar.default, {
    vertical: true
  }, (menubar, menubarRef) => /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, menubar, rest, {
    ref: (0, _utils.mergeRefs)(menubarRef, ref),
    className: classes,
    role: "menu"
  }), children)));
}, Subcomponents);
Menu.displayName = 'Menu';
var _default = exports.default = Menu;