'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ArrowUpLine = _interopRequireDefault(require("@rsuite/icons/ArrowUpLine"));
var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));
var _InputGroup = _interopRequireDefault(require("../InputGroup/InputGroup"));
var _InputGroupAddon = _interopRequireDefault(require("../InputGroup/InputGroupAddon"));
var _Input = _interopRequireDefault(require("../Input"));
var _Button = _interopRequireDefault(require("../Button"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _useNumberInputValue = require("./hooks/useNumberInputValue");
var _useEvents = require("./hooks/useEvents");
var _number = require("./utils/number");
/**
 * The `NumberInput` component is used to enter a numerical value.
 * @see https://rsuitejs.com/components/number-input
 */
const NumberInput = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('NumberInput', props);
  const {
    as,
    className,
    classPrefix = 'number-input',
    controls = true,
    disabled,
    decimalSeparator,
    formatter,
    readOnly,
    plaintext,
    value: valueProp,
    defaultValue,
    size,
    prefix: prefixElement,
    postfix,
    suffix = postfix,
    step = 1,
    buttonAppearance = 'subtle',
    min: minProp,
    max: maxProp,
    scrollable = true,
    onChange,
    onWheel,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    ...rest
  } = propsWithDefaults;
  const min = minProp !== null && minProp !== void 0 ? minProp : -Infinity;
  const max = maxProp !== null && maxProp !== void 0 ? maxProp : Infinity;
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)(rest);
  const onChangeValue = (currentValue, event) => {
    if (currentValue !== value) {
      setValue(currentValue);
      onChange === null || onChange === void 0 || onChange(currentValue, event);
    }
  };
  const {
    inputRef,
    isFocused,
    onStepUp,
    onStepDown,
    onKeyDown,
    onFocus,
    onBlur
  } = (0, _useEvents.useEvents)({
    min: minProp,
    max: maxProp,
    step,
    value,
    scrollable,
    disabled,
    readOnly,
    decimalSeparator,
    onWheel,
    onChangeValue
  });
  const handleChange = (0, _hooks.useEventCallback)((value, event) => {
    const separator = decimalSeparator || '.';
    const escapedSeparator = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

    // Support both custom decimalSeparator and standard decimal point '.'
    let regex;
    if (separator !== '.') {
      // Allow both the custom separator and the standard decimal point
      regex = new RegExp(`^-?(?:\\d+)?([.${escapedSeparator}])?\\d*$`);
    } else {
      regex = new RegExp(`^-?(?:\\d+)?(${escapedSeparator})?\\d*$`);
    }
    if (!regex.test(value) && value !== '') {
      return;
    }
    onChangeValue(value, event);
  });
  const inputValue = (0, _useNumberInputValue.useNumberInputValue)({
    value,
    isFocused,
    formatter,
    decimalSeparator
  });
  const input = /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({}, htmlInputProps, {
    ref: plaintext ? ref : undefined,
    inputRef: inputRef,
    autoComplete: "off",
    inputMode: "numeric",
    step: step,
    value: inputValue,
    disabled: disabled,
    readOnly: readOnly,
    plaintext: plaintext,
    onKeyDown: onKeyDown,
    onChange: handleChange,
    onBlur: (0, _utils.createChainedFunction)(onBlur, onBlurProp),
    onFocus: (0, _utils.createChainedFunction)(onFocus, onFocusProp)
  }));
  if (plaintext) {
    return input;
  }
  const stepUpDisabled = disabled || readOnly || (0, _number.valueReachesMax)(value, max);
  const stepDownDisabled = disabled || readOnly || (0, _number.valueReachesMin)(value, min);
  return /*#__PURE__*/_react.default.createElement(_InputGroup.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    disabled: disabled,
    size: size,
    inside: true
  }, restProps), prefixElement && /*#__PURE__*/_react.default.createElement(_InputGroupAddon.default, null, prefixElement), input, suffix && /*#__PURE__*/_react.default.createElement(_InputGroupAddon.default, null, suffix), controls && /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('btn-group-vertical')
  }, /*#__PURE__*/_react.default.createElement(_Button.default, {
    tabIndex: -1,
    appearance: buttonAppearance,
    className: prefix('touchspin-up'),
    onClick: onStepUp,
    disabled: stepUpDisabled,
    "aria-label": "Increment",
    size: size
  }, typeof controls === 'function' ? controls('up') : /*#__PURE__*/_react.default.createElement(_ArrowUpLine.default, null)), /*#__PURE__*/_react.default.createElement(_Button.default, {
    tabIndex: -1,
    appearance: buttonAppearance,
    className: prefix('touchspin-down'),
    onClick: onStepDown,
    disabled: stepDownDisabled,
    "aria-label": "Decrement",
    size: size
  }, typeof controls === 'function' ? controls('down') : /*#__PURE__*/_react.default.createElement(_ArrowDownLine.default, null))));
});
NumberInput.displayName = 'NumberInput';
var _default = exports.default = NumberInput;