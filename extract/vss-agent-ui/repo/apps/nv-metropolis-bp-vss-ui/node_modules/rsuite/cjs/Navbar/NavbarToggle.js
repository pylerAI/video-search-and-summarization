'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Burger = require("../internals/Burger");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _NavbarContext = require("./NavbarContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const NavbarToggle = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    navbarId,
    open: contextOpen,
    onToggle: onToggleContext
  } = (0, _react.useContext)(_NavbarContext.NavbarContext) || {};
  const {
    open,
    onClick,
    onToggle,
    ...rest
  } = props;
  const handleClick = (0, _hooks.useEventCallback)(() => {
    onToggle === null || onToggle === void 0 || onToggle(true);
    onToggleContext === null || onToggleContext === void 0 || onToggleContext(true);
  });
  return /*#__PURE__*/_react.default.createElement(_Burger.Burger, (0, _extends2.default)({
    ref: ref,
    onClick: (0, _utils.createChainedFunction)(handleClick, onClick),
    "aria-controls": `${navbarId}-drawer`,
    open: typeof open === 'boolean' ? open : contextOpen
  }, rest));
});
NavbarToggle.displayName = 'NavbarToggle';
var _default = exports.default = NavbarToggle;