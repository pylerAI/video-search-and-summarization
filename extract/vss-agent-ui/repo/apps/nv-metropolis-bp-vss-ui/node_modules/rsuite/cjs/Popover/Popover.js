'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Heading = _interopRequireDefault(require("../Heading"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Popover` component is used to display a popup window for a target component.
 * @see https://rsuitejs.com/components/popover
 */
const Popover = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Popover', props);
  const {
    as,
    classPrefix = 'popover',
    title,
    children,
    style,
    visible,
    className,
    full,
    arrow = true,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    full
  }));
  const styles = (0, _react.useMemo)(() => (0, _utils.mergeStyles)(style, {
    ['--rs-opacity']: visible ? 1 : undefined
  }), [visible, style]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "dialog",
    ref: ref,
    className: classes,
    style: styles
  }, rest), arrow && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`arrow`,
    "aria-hidden": true
  }), title && /*#__PURE__*/_react.default.createElement(_Heading.default, {
    level: 3,
    className: prefix`title`
  }, title), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`content`
  }, children));
});
Popover.displayName = 'Popover';
var _default = exports.default = Popover;