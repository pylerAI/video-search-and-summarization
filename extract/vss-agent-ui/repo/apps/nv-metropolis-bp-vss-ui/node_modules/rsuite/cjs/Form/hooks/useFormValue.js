'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = useFormValue;
var _react = require("react");
var _omit = _interopRequireDefault(require("lodash/omit"));
var _set = _interopRequireDefault(require("lodash/set"));
var _hooks = require("../../internals/hooks");
function useFormValue(controlledValue, props) {
  const {
    formDefaultValue,
    nestedField
  } = props;
  const [formValue, setFormValue] = (0, _hooks.useControlled)(controlledValue, formDefaultValue);
  const realFormValueRef = (0, _react.useRef)(formValue);
  realFormValueRef.current = formValue;
  const setFieldValue = (0, _react.useCallback)((fieldName, fieldValue) => {
    const nextFormError = nestedField ? (0, _set.default)({
      ...formValue
    }, fieldName, fieldValue) : {
      ...formValue,
      [fieldName]: fieldValue
    };
    setFormValue(nextFormError);
    return nextFormError;
  }, [formValue, nestedField, setFormValue]);
  const onRemoveValue = (0, _react.useCallback)(name => {
    /**
     * when this function is called when the children component is unmount,
     * it's an old render frame so use Ref to get future value
     */
    const formValue = (0, _omit.default)(realFormValueRef.current, [name]);
    realFormValueRef.current = formValue;
    setFormValue(formValue);
    return formValue;
  }, [setFormValue]);
  const resetFormValue = (0, _react.useCallback)(nextValue => {
    const value = nextValue || formDefaultValue;
    setFormValue(value);
    return value;
  }, [formDefaultValue, setFormValue]);
  return {
    formValue,
    setFormValue,
    setFieldValue,
    onRemoveValue,
    resetFormValue
  };
}