'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ButtonGroupContext = _interopRequireDefault(require("./ButtonGroupContext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The ButtonGroup component is used to group a series of buttons together in a single line or column.
 * @see https://rsuitejs.com/components/button/#button-group
 */
const ButtonGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('ButtonGroup', props);
  const {
    as,
    classPrefix = 'btn-group',
    role = 'group',
    className,
    children,
    disabled,
    divided,
    block,
    vertical,
    justified,
    size,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const contextValue = (0, _react.useMemo)(() => ({
    size,
    disabled
  }), [disabled, size]);
  return /*#__PURE__*/_react.default.createElement(_ButtonGroupContext.default.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    role: role,
    ref: ref,
    className: classes,
    "data-size": size,
    "data-block": block,
    "data-vertical": vertical,
    "data-justified": justified,
    "data-divided": divided
  }), children));
});
ButtonGroup.displayName = 'ButtonGroup';
var _default = exports.default = ButtonGroup;