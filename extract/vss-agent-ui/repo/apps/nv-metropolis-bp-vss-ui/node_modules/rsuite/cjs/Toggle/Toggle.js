'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _Loader = _interopRequireDefault(require("../Loader"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Toggle` component is used to activate or deactivate an element.
 *
 * @see https://rsuitejs.com/components/toggle
 */
const Toggle = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Toggle', props);
  const {
    as = 'label',
    disabled,
    readOnly,
    loading = false,
    plaintext,
    children,
    className,
    color,
    checkedChildren,
    unCheckedChildren,
    classPrefix = 'toggle',
    checked: checkedProp,
    defaultChecked,
    size = 'md',
    locale,
    label = children,
    labelPlacement = 'end',
    onChange,
    ...rest
  } = propsWithDefaults;
  const inputRef = (0, _react.useRef)(null);
  const [checked, setChecked] = (0, _hooks.useControlled)(checkedProp, defaultChecked);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({}));
  const inner = checked ? checkedChildren : unCheckedChildren;
  const innerLabel = checked ? locale === null || locale === void 0 ? void 0 : locale.on : locale === null || locale === void 0 ? void 0 : locale.off;
  const labelId = (0, _hooks.useUniqueId)('rs-label');
  const innerId = inner ? labelId + '-inner' : undefined;
  const labelledby = label ? labelId : innerId;
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)(rest);
  const handleInputChange = (0, _hooks.useEventCallback)(e => {
    if (disabled || readOnly || loading) {
      return;
    }
    const {
      checked
    } = e.target;
    setChecked(checked);
    onChange === null || onChange === void 0 || onChange(checked, e);
  });
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, null, inner || innerLabel);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-placement": labelPlacement,
    "data-color": color,
    "data-size": size,
    "data-checked": checked,
    "data-loading": loading,
    "data-disabled": disabled
  }, restProps), /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, {
    ref: inputRef,
    type: "checkbox",
    checked: checkedProp,
    defaultChecked: defaultChecked,
    disabled: disabled,
    readOnly: readOnly,
    onChange: handleInputChange,
    className: prefix('input'),
    role: "switch",
    "aria-checked": checked,
    "aria-disabled": disabled,
    "aria-labelledby": labelledby,
    "aria-label": labelledby ? undefined : innerLabel,
    "aria-busy": loading || undefined
  })), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('track')
  }, inner && /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('inner'),
    id: innerId
  }, inner), loading && /*#__PURE__*/_react.default.createElement(_Loader.default, {
    className: prefix('loader')
  })), label && /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('label'),
    id: labelId
  }, label));
});
Toggle.displayName = 'Toggle';
var _default = exports.default = Toggle;