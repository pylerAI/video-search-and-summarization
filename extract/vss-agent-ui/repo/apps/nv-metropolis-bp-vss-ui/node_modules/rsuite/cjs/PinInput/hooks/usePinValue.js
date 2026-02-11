'use client';
"use strict";

exports.__esModule = true;
exports.usePinValue = exports.default = void 0;
var _react = require("react");
var _hooks = require("../../internals/hooks");
/**
 * Hook for managing pin input value
 * - Handles controlled/uncontrolled value
 * - Normalizes value to array format
 * - Manages array updates and modifications
 */
const usePinValue = (controlValue, defaultValue, length, onChange, onComplete) => {
  // Use controlled pattern for value management
  const [value, setValue] = (0, _hooks.useControlled)(controlValue, defaultValue);

  // Convert string value to array of characters
  const valueArray = (0, _react.useMemo)(() => {
    // Ensure value is a string and split it into an array of characters
    const valueString = value || '';
    const chars = valueString.split('');

    // Pad the array with empty strings if needed
    while (chars.length < length) {
      chars.push('');
    }

    // Trim the array if it's too long
    if (chars.length > length) {
      chars.length = length;
    }
    return chars;
  }, [value, length]);

  // Update specific digit at index
  const setDigit = (index, digit) => {
    if (index < 0 || index >= length) return;
    const newValueArray = [...valueArray];
    newValueArray[index] = digit;
    updateValue(newValueArray.join(''));
  };

  // Clear specific digit at index
  const clearDigit = index => {
    if (index < 0 || index >= length) return;
    const newValueArray = [...valueArray];
    newValueArray[index] = '';
    updateValue(newValueArray.join(''));
  };

  // Set entire value at once
  const updateValue = newValue => {
    // Filter out any extra characters beyond length
    const filteredValue = newValue.slice(0, length);
    setValue(filteredValue);
    onChange === null || onChange === void 0 || onChange(filteredValue);

    // Call onComplete if the value is complete
    if (filteredValue.length === length) {
      onComplete === null || onComplete === void 0 || onComplete(filteredValue);
    }
  };
  return {
    value,
    valueArray,
    setDigit,
    clearDigit,
    updateValue
  };
};
exports.usePinValue = usePinValue;
var _default = exports.default = usePinValue;