'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The Badge component is usually used to mark or highlight the status or quantity of an object.
 * @see https://rsuitejs.com/components/badge
 */
const Badge = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Badge', props);
  const {
    as,
    content,
    color,
    className,
    classPrefix = 'badge',
    children,
    compact,
    maxCount = 99,
    offset,
    outline = true,
    placement = 'topEnd',
    shape,
    size = 'md',
    style,
    invisible,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const text = typeof content === 'number' && content > maxCount ? `${maxCount}+` : content;
  const isOneChar = (0, _react.useMemo)(() => {
    var _String;
    return ((_String = String(content)) === null || _String === void 0 ? void 0 : _String.length) === 1;
  }, [content]);
  const classes = merge(className, withPrefix({
    wrapper: children
  }));
  const styles = (0, _react.useMemo)(() => (0, _utils.mergeStyles)(style, (0, _utils.createOffsetStyles)(offset, '--rs-badge-offset'), (0, _utils.createColorVariables)(color, '--rs-badge-bg')), [style, offset, color]);
  const dataAttributes = (0, _react.useMemo)(() => {
    return {
      ['data-color']: (0, _utils.isPresetColor)(color) ? color : undefined,
      ['data-shape']: shape,
      ['data-compact']: compact,
      ['data-one-char']: isOneChar,
      ['data-outline']: outline,
      ['data-hidden']: invisible,
      ['data-independent']: !children,
      ['data-placement']: children ? placement : undefined,
      ['data-size']: size
    };
  }, [color, shape, compact, isOneChar, outline, invisible, children, placement, size]);
  if (!children) {
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: ref,
      className: classes,
      style: styles
    }, dataAttributes, rest), text);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles
  }, dataAttributes, rest), children, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, text));
});
Badge.displayName = 'Badge';
var _default = exports.default = Badge;