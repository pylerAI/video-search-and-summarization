'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _RadioGroup = require("../RadioGroup/RadioGroup");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Radio` component is a simple radio button.
 * @see https://rsuitejs.com/components/radio
 */
const Radio = (0, _utils.forwardRef)((props, ref) => {
  const radioContext = (0, _react.useContext)(_RadioGroup.RadioContext);
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Radio', props);
  const {
    value: groupValue,
    inline: inlineContext,
    name: nameContext,
    disabled: disabledContext,
    readOnly: readOnlyContext,
    plaintext: plaintextContext,
    onChange: onGroupChange
  } = radioContext !== null && radioContext !== void 0 ? radioContext : {};
  const {
    as,
    title,
    className,
    children,
    checked: checkedProp,
    color,
    defaultChecked,
    classPrefix = 'radio',
    tabIndex = 0,
    inputRef,
    inputProps,
    disabled = disabledContext,
    readOnly = readOnlyContext,
    plaintext = plaintextContext,
    inline = inlineContext,
    name = nameContext,
    value,
    onChange,
    onClick,
    ...rest
  } = propsWithDefaults;
  const [checked, setChecked, selfControlled] = (0, _hooks.useControlled)(typeof groupValue !== 'undefined' ? groupValue === value : checkedProp, defaultChecked || false);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)(rest);
  const handleChange = (0, _hooks.useEventCallback)(event => {
    if (disabled || readOnly) {
      return;
    }
    setChecked(true);
    onGroupChange === null || onGroupChange === void 0 || onGroupChange(value, event);
    onChange === null || onChange === void 0 || onChange(value, true, event);
  });
  const controlled = radioContext ? true : selfControlled;
  if (typeof controlled !== 'undefined') {
    // In uncontrolled situations, use defaultChecked instead of checked
    htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
  }
  const labelId = (0, _hooks.useUniqueId)('label-');
  if (plaintext) {
    return checked ? /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: ref,
      className: classes
    }, restProps), children) : null;
  }
  const control = /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`control`
  }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, inputProps, {
    "aria-labelledby": labelId,
    "aria-checked": checked,
    "aria-disabled": disabled,
    ref: inputRef,
    type: "radio",
    name: name,
    value: value,
    tabIndex: tabIndex,
    readOnly: readOnly,
    disabled: disabled,
    onChange: handleChange
  })), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`inner`,
    "aria-hidden": true
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    onClick: onClick,
    className: classes,
    "data-color": color,
    "data-checked": checked,
    "data-disabled": disabled,
    "data-inline": inline
  }, restProps), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`checker`
  }, children ? /*#__PURE__*/_react.default.createElement("label", {
    title: title
  }, control, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`label`,
    id: labelId
  }, children)) : control));
});
Radio.displayName = 'Radio';
var _default = exports.default = Radio;