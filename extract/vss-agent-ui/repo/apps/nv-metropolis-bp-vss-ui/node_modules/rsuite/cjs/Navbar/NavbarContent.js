'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _NavbarContext = require("./NavbarContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const NavbarContent = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    className,
    classPrefix = 'navbar-content',
    children,
    ...rest
  } = props;
  const {
    onToggle
  } = (0, _react.useContext)(_NavbarContext.NavbarContext) || {};
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const onClose = (0, _react.useCallback)(() => {
    onToggle === null || onToggle === void 0 || onToggle(false);
  }, [onToggle]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    ref: ref,
    className: classes
  }, rest), typeof children === 'function' ? children({
    onClose
  }) : children);
});
NavbarContent.displayName = 'NavbarContent';
var _default = exports.default = NavbarContent;