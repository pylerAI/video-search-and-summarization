'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.useNumberInputValue = useNumberInputValue;
var _react = require("react");
var _isNil = _interopRequireDefault(require("lodash/isNil"));
function useNumberInputValue(params) {
  const {
    value,
    isFocused,
    formatter,
    decimalSeparator
  } = params;
  const replaceDecimalSeparator = (0, _react.useCallback)(val => {
    if (decimalSeparator && val != null) {
      return val.toString().replace('.', decimalSeparator);
    }
    return val;
  }, [decimalSeparator]);
  return (0, _react.useMemo)(() => {
    if ((0, _isNil.default)(value)) {
      return '';
    }
    if (isFocused) {
      return replaceDecimalSeparator(value);
    }
    if (formatter) {
      return formatter(value);
    }
    return replaceDecimalSeparator(value);
  }, [formatter, isFocused, replaceDecimalSeparator, value]);
}