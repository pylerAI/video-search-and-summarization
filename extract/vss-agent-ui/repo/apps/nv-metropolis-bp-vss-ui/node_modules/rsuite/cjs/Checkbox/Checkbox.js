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
var _useIndeterminateCheckbox = require("./hooks/useIndeterminateCheckbox");
var _CheckboxGroup = require("../CheckboxGroup");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The Checkbox component is used for selecting multiple options from a set.
 * @see https://rsuitejs.com/components/checkbox
 */
const Checkbox = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Checkbox', props);
  const checkboxGroupContext = (0, _react.useContext)(_CheckboxGroup.CheckboxGroupContext);
  const {
    inline: inlineContext,
    name: nameContext,
    disabled: disabledContext,
    readOnly: readOnlyContext,
    plaintext: plaintextContext,
    onChange: onGroupChange
  } = checkboxGroupContext !== null && checkboxGroupContext !== void 0 ? checkboxGroupContext : {};
  const {
    as,
    checked: controlledChecked,
    className,
    children,
    classPrefix = 'checkbox',
    checkable = true,
    color,
    defaultChecked = false,
    title,
    inputRef,
    inputProps,
    indeterminate,
    labelClickable = true,
    tabIndex = 0,
    disabled = disabledContext,
    readOnly = readOnlyContext,
    plaintext = plaintextContext,
    inline = inlineContext,
    name = nameContext,
    value,
    onClick,
    onCheckboxClick,
    onChange,
    ...rest
  } = propsWithDefaults;
  const [selfChecked, setSelfChecked, selfControlled] = (0, _hooks.useControlled)(controlledChecked, defaultChecked);

  // Either <Checkbox> is checked itself or by parent <CheckboxGroup>
  const checked = (0, _react.useMemo)(() => {
    var _checkboxGroupContext, _checkboxGroupContext2;
    if (!checkboxGroupContext) {
      return selfChecked;
    }

    // fixme value from group should not be nullable
    return (_checkboxGroupContext = (_checkboxGroupContext2 = checkboxGroupContext.value) === null || _checkboxGroupContext2 === void 0 ? void 0 : _checkboxGroupContext2.some(checkedValue => checkedValue === value)) !== null && _checkboxGroupContext !== void 0 ? _checkboxGroupContext : false;
  }, [checkboxGroupContext, selfChecked, value]);
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)(rest);

  // If <Checkbox> is within a <CheckboxGroup>, it's bound to be controlled
  // because its checked state is inferred from group's value, not retrieved from the DOM
  const controlled = checkboxGroupContext ? true : selfControlled;
  if (typeof controlled !== 'undefined') {
    // In uncontrolled situations, use defaultChecked instead of checked
    htmlInputProps[controlled ? 'checked' : 'defaultChecked'] = checked;
  }
  const checkboxRef = (0, _useIndeterminateCheckbox.useIndeterminateCheckbox)(indeterminate);
  const handleChange = (0, _hooks.useEventCallback)(event => {
    const nextChecked = event.target.checked;
    if (disabled || readOnly) {
      return;
    }
    setSelfChecked(nextChecked);
    onChange === null || onChange === void 0 || onChange(value, nextChecked, event);
    onGroupChange === null || onGroupChange === void 0 || onGroupChange(value, nextChecked, event);
  });
  const handleLabelClick = (0, _hooks.useEventCallback)(event => {
    // Prevent check when label is not clickable
    if (!labelClickable && event.target !== checkboxRef.current) {
      event.preventDefault();
    }
  });
  const labelId = (0, _hooks.useUniqueId)('label-');
  if (plaintext) {
    return checked ? /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as
    }, restProps, {
      ref: ref,
      className: classes
    }), children) : null;
  }
  const control = /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`control`
  }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, inputProps, {
    "aria-disabled": disabled,
    "aria-checked": indeterminate ? 'mixed' : checked,
    "aria-labelledby": labelId,
    name: name,
    value: value,
    type: "checkbox",
    ref: (0, _utils.mergeRefs)(checkboxRef, inputRef),
    tabIndex: tabIndex,
    readOnly: readOnly,
    disabled: disabled,
    onClick: onCheckboxClick,
    onChange: handleChange
  })), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`inner`,
    "aria-hidden": true,
    "data-testid": "checkbox-control-inner"
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, restProps, {
    ref: ref,
    onClick: onClick,
    className: classes,
    "data-color": color,
    "data-checked": indeterminate ? 'mixed' : checked,
    "data-disabled": disabled,
    "data-inline": inline
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`checker`
  }, /*#__PURE__*/_react.default.createElement("label", {
    title: title,
    onClick: handleLabelClick
  }, checkable ? control : null, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`label`,
    id: labelId
  }, children))));
});
Checkbox.displayName = 'Checkbox';
var _default = exports.default = Checkbox;