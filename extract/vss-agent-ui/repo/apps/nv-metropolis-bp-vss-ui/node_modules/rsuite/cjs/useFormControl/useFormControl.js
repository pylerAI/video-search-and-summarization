'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useFormControl = useFormControl;
var _react = require("react");
var _FormContext = require("../Form/FormContext");
var _hooks = require("../internals/hooks");
var _useRegisterModel = require("./hooks/useRegisterModel");
var _useField = require("./hooks/useField");
/**
 * Hook for accessing form control functionality.
 * Must be used within a Form component.
 *
 * @param props The form control properties
 * @returns Form control functionality for the specified field
 */
function useFormControl(props) {
  const {
    name,
    value: controlledValue,
    checkTrigger,
    errorMessage,
    checkAsync = false,
    shouldResetWithUnmount = false,
    rule
  } = props;
  const {
    readOnly,
    plaintext,
    disabled,
    errorFromContext,
    formError,
    nestedField,
    onFieldChange,
    removeFieldValue,
    removeFieldError,
    checkTrigger: contextCheckTrigger,
    checkFieldForNextValue,
    checkFieldAsyncForNextValue
  } = (0, _FormContext.useFormContext)();

  // Throw an error if not used within a Form component
  if (!onFieldChange) {
    console.error(`<useFormControl> must be used inside a component decorated with <Form>. And need to update React to 16.6.0 +.`);
  }
  const formValue = (0, _react.useContext)(_FormContext.FormValueContext);

  // Register form field model
  (0, _useRegisterModel.useRegisterModel)(name, rule);

  // Cleanup on unmount if shouldResetWithUnmount is true
  (0, _hooks.useWillUnmount)(() => {
    if (shouldResetWithUnmount) {
      removeFieldValue === null || removeFieldValue === void 0 || removeFieldValue(name);
      removeFieldError === null || removeFieldError === void 0 || removeFieldError(name);
    }
  });

  // Use the useField hook to handle field value and error
  const {
    fieldValue: value,
    fieldError: error,
    setFieldValue
  } = (0, _useField.useField)({
    name,
    errorMessage,
    formValue,
    formError,
    value: controlledValue,
    nestedField,
    errorFromContext
  });
  const trigger = checkTrigger || contextCheckTrigger;

  // Handler for field check (validation)
  const onCheck = (0, _hooks.useEventCallback)(value => {
    // Don't perform validation when checkTrigger is null
    if (trigger === null) {
      return;
    }
    const nextFormValue = setFieldValue(name, value);
    if (checkAsync) {
      checkFieldAsyncForNextValue === null || checkFieldAsyncForNextValue === void 0 || checkFieldAsyncForNextValue(name, nextFormValue);
    } else {
      checkFieldForNextValue === null || checkFieldForNextValue === void 0 || checkFieldForNextValue(name, nextFormValue);
    }
  });

  // Handler for field change
  const onChange = (0, _hooks.useEventCallback)((value, event) => {
    if (trigger === 'change') {
      onCheck(value);
    }
    onFieldChange === null || onFieldChange === void 0 || onFieldChange(name, value, event);
  });

  // Handler for field blur
  const onBlur = (0, _hooks.useEventCallback)(() => {
    if (trigger === 'blur') {
      onCheck(value);
    }
  });

  /**
   * Directly sets the field value without triggering validation or onChange events.
   * Useful for programmatically updating field values.
   * @param value The new value to set
   * @param shouldValidate Whether to trigger validation (defaults to false)
   */
  const setValue = (0, _react.useCallback)((value, shouldValidate = false) => {
    const nextFormValue = setFieldValue(name, value);
    onFieldChange === null || onFieldChange === void 0 || onFieldChange(name, value);
    if (shouldValidate && trigger !== null) {
      if (checkAsync) {
        checkFieldAsyncForNextValue === null || checkFieldAsyncForNextValue === void 0 || checkFieldAsyncForNextValue(name, nextFormValue);
      } else {
        checkFieldForNextValue === null || checkFieldForNextValue === void 0 || checkFieldForNextValue(name, nextFormValue);
      }
    }
  }, [name, setFieldValue, trigger, checkAsync, checkFieldAsyncForNextValue, checkFieldForNextValue]);
  return {
    value,
    error,
    plaintext,
    readOnly,
    disabled,
    onChange,
    onCheck,
    onBlur,
    setValue
  };
}
var _default = exports.default = useFormControl;