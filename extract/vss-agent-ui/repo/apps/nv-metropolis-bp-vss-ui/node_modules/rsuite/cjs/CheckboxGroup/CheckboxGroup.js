'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _CheckboxGroupContext = require("./CheckboxGroupContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `CheckboxGroup` component is used for selecting multiple options which are unrelated.
 * @see https://rsuitejs.com/components/checkbox/#checkbox-group
 */
const CheckboxGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('CheckboxGroup', props);
  const {
    as,
    className,
    inline,
    children,
    name,
    value: valueProp,
    defaultValue,
    classPrefix = 'checkbox-group',
    disabled,
    readOnly,
    plaintext,
    onChange,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const handleChange = (0, _react.useCallback)((itemValue, itemChecked, event) => {
    const nextValue = (0, _cloneDeep.default)(value) || [];
    if (itemChecked) {
      nextValue.push(itemValue);
    } else {
      (0, _remove.default)(nextValue, i => (0, _utils.shallowEqual)(i, itemValue));
    }
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  }, [onChange, setValue, value]);
  const contextValue = (0, _react.useMemo)(() => ({
    inline,
    name,
    value,
    readOnly,
    disabled,
    plaintext,
    controlled: isControlled,
    onChange: handleChange
  }), [disabled, handleChange, inline, isControlled, name, plaintext, readOnly, value]);
  return /*#__PURE__*/_react.default.createElement(_CheckboxGroupContext.CheckboxGroupContext.Provider, {
    value: contextValue
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
    ref: ref,
    localeKey: "notSelected"
  }, rest), value !== null && value !== void 0 && value.length ? children : null) : /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: ref,
    role: "group",
    className: classes,
    "data-inline": inline
  }), children));
});
CheckboxGroup.displayName = 'CheckboxGroup';
var _default = exports.default = CheckboxGroup;