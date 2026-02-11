'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.RadioContext = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const RadioContext = exports.RadioContext = /*#__PURE__*/_react.default.createContext(void 0);

/**
 * The `RadioGroup` component is used to group a collection of `Radio` components.
 * @see https://rsuitejs.com/components/radio/#radio-group
 */
const RadioGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('RadioGroup', props);
  const {
    as,
    className,
    inline,
    children,
    classPrefix = 'radio-group',
    value: valueProp,
    defaultValue,
    appearance = 'default',
    name,
    plaintext,
    disabled,
    readOnly,
    onChange,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const handleChange = (0, _hooks.useEventCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue !== null && nextValue !== void 0 ? nextValue : '', event);
  });
  const contextValue = (0, _react.useMemo)(() => ({
    inline,
    name,
    value: typeof value === 'undefined' ? null : value,
    controlled: isControlled,
    plaintext,
    disabled,
    readOnly,
    onChange: handleChange
  }), [disabled, handleChange, inline, isControlled, name, plaintext, readOnly, value]);
  return /*#__PURE__*/_react.default.createElement(RadioContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value ? children : null) : /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "radiogroup"
  }, rest, {
    ref: ref,
    className: classes,
    "data-inline": inline,
    "data-appearance": appearance
  }), children));
});
RadioGroup.displayName = 'RadioGroup';
var _default = exports.default = RadioGroup;