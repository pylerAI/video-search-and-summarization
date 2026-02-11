'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.useField = useField;
var _get = _interopRequireDefault(require("lodash/get"));
var _set = _interopRequireDefault(require("lodash/set"));
var _react = require("react");
var _nameToPath = require("../utils/nameToPath");
function getErrorMessage(error) {
  var _error$array;
  if (typeof error === 'string') {
    return error;
  }

  /**
   * When using some components as the field, such as TagInput, and using `ArrayType().of` as the validation rule,
   * the error object won't contain the errorMessage directly. @see https://github.com/rsuite/rsuite/issues/3866
   */
  if (error !== null && error !== void 0 && error.array && ((_error$array = error.array) === null || _error$array === void 0 ? void 0 : _error$array.length) > 0) {
    var _error$array$find;
    return (_error$array$find = error.array.find(item => item.hasError)) === null || _error$array$find === void 0 ? void 0 : _error$array$find.errorMessage;
  }
  if (/*#__PURE__*/(0, _react.isValidElement)(error)) {
    return error;
  }
  return error === null || error === void 0 ? void 0 : error.errorMessage;
}
function useField(props) {
  const {
    name,
    formValue,
    formError,
    value,
    nestedField,
    errorMessage,
    errorFromContext
  } = props;
  const fieldValue = (0, _react.useMemo)(() => {
    if (typeof value !== 'undefined') {
      return value;
    }
    return nestedField ? (0, _get.default)(formValue, name) : formValue === null || formValue === void 0 ? void 0 : formValue[name];
  }, [formValue, name, nestedField, value]);
  const fieldError = (0, _react.useMemo)(() => {
    if (typeof errorMessage !== 'undefined' || !errorFromContext) {
      return errorMessage;
    }
    if (nestedField) {
      return getErrorMessage((0, _get.default)(formError, (0, _nameToPath.nameToPath)(name)));
    }
    const fieldError = formError === null || formError === void 0 ? void 0 : formError[name];
    if (typeof fieldError === 'string') {
      return fieldError;
    }
    return getErrorMessage(fieldError);
  }, [errorFromContext, errorMessage, formError, name, nestedField]);
  const setFieldValue = (0, _react.useCallback)((fieldName, fieldValue) => {
    if (nestedField) {
      return (0, _set.default)({
        ...formValue
      }, fieldName, fieldValue);
    }
    return {
      ...formValue,
      [fieldName]: fieldValue
    };
  }, [formValue, nestedField]);
  return {
    fieldValue,
    fieldError,
    setFieldValue
  };
}