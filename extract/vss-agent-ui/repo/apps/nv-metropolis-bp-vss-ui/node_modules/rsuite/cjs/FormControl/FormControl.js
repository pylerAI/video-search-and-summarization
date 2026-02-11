'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Input = _interopRequireDefault(require("../Input"));
var _FormErrorMessage = _interopRequireDefault(require("../FormErrorMessage"));
var _Toggle = _interopRequireDefault(require("../Toggle"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _FormGroup = require("../FormGroup");
var _useFormControl = require("../useFormControl");
/**
 * Props that FormControl passes to its accepter
 */

/**
 * The `<Form.Control>` component is used to wrap the components that need to be validated.
 * @see https://rsuitejs.com/components/form/
 */
const FormControl = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('FormControl', props);
  const {
    as,
    accepter: AccepterComponent = _Input.default,
    classPrefix = 'form-control',
    name,
    value,
    readOnly,
    plaintext,
    disabled,
    onChange: propsOnChange,
    onBlur: propsOnBlur,
    defaultValue,
    checkTrigger,
    errorMessage,
    errorPlacement = 'bottomStart',
    checkAsync,
    shouldResetWithUnmount,
    rule,
    id,
    ...rest
  } = propsWithDefaults;
  const {
    controlId,
    helpTextId,
    labelId,
    errorMessageId
  } = (0, _FormGroup.useFormGroup)(id);

  // Use the useFormControl hook to handle form control logic
  const {
    value: fieldValue,
    error: fieldError,
    plaintext: contextPlaintext,
    readOnly: contextReadOnly,
    disabled: contextDisabled,
    onChange: handleFieldChange,
    onBlur: handleFieldBlur
  } = (0, _useFormControl.useFormControl)({
    name,
    value,
    checkTrigger,
    errorMessage,
    checkAsync,
    shouldResetWithUnmount,
    rule
  });

  // Combine props and context values
  const resolvedReadOnly = readOnly !== null && readOnly !== void 0 ? readOnly : contextReadOnly;
  const resolvedPlaintext = plaintext !== null && plaintext !== void 0 ? plaintext : contextPlaintext;
  const resolvedDisabled = disabled !== null && disabled !== void 0 ? disabled : contextDisabled;
  const {
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = withPrefix('wrapper');

  // Handle onChange with both hook's implementation and prop callback
  const handleChange = (value, event) => {
    handleFieldChange(value, event);
    propsOnChange === null || propsOnChange === void 0 || propsOnChange(value, event);
  };

  // Handle onBlur with both hook's implementation and prop callback
  const handleBlur = event => {
    handleFieldBlur(); // onBlur doesn't take parameters in the hook
    propsOnBlur === null || propsOnBlur === void 0 || propsOnBlur(event);
  };

  // Toggle component is a special case that uses `checked` and `defaultChecked` instead of `value` and `defaultValue` props.
  const valueKey = AccepterComponent === _Toggle.default ? 'checked' : 'value';
  const accepterProps = {
    // need to distinguish between undefined and null
    [valueKey]: fieldValue === undefined ? defaultValue : fieldValue
  };
  const hasError = Boolean(fieldError);
  return /*#__PURE__*/_react.default.createElement(_Box.default, {
    as: as,
    className: classes,
    ref: ref,
    "data-testid": "form-control-wrapper"
  }, /*#__PURE__*/_react.default.createElement(AccepterComponent, (0, _extends2.default)({
    id: controlId,
    "aria-labelledby": labelId,
    "aria-describedby": helpTextId,
    "aria-invalid": hasError || undefined,
    "aria-errormessage": hasError ? errorMessageId : undefined
  }, accepterProps, rest, {
    readOnly: resolvedReadOnly,
    plaintext: resolvedPlaintext,
    disabled: resolvedDisabled,
    name: name,
    onChange: handleChange,
    onBlur: handleBlur
  })), /*#__PURE__*/_react.default.createElement(_FormErrorMessage.default, {
    id: errorMessageId,
    role: "alert",
    "aria-relevant": "all",
    show: hasError,
    className: prefix`message-wrapper`,
    placement: errorPlacement
  }, fieldError));
});
FormControl.displayName = 'FormControl';
var _default = exports.default = FormControl;