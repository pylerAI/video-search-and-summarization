'use client';
"use strict";

exports.__esModule = true;
exports.usePinInputRefs = exports.default = void 0;
var _react = require("react");
/**
 * A hook that manages the refs and focus behavior for a PIN input component
 */
const usePinInputRefs = (length, autoFocus) => {
  // Create ref to store input elements
  const inputRefs = (0, _react.useRef)([]);

  // Initialize the refs array when length changes
  (0, _react.useEffect)(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  // Auto focus the first input on mount if autoFocus is true
  (0, _react.useEffect)(() => {
    if (autoFocus && inputRefs.current[0]) {
      var _inputRefs$current$;
      (_inputRefs$current$ = inputRefs.current[0]) === null || _inputRefs$current$ === void 0 || _inputRefs$current$.focus();
    }
  }, [autoFocus]);

  // Focus a specific input by index
  const focusInput = (0, _react.useCallback)(index => {
    if (index >= 0 && index < length && inputRefs.current[index]) {
      var _inputRefs$current$in;
      (_inputRefs$current$in = inputRefs.current[index]) === null || _inputRefs$current$in === void 0 || _inputRefs$current$in.focus();
      return true;
    }
    return false;
  }, [length]);

  // Focus the next input
  const focusNextInput = (0, _react.useCallback)(currentIndex => {
    return focusInput(currentIndex + 1);
  }, [focusInput]);

  // Focus the previous input
  const focusPrevInput = (0, _react.useCallback)(currentIndex => {
    return focusInput(currentIndex - 1);
  }, [focusInput]);

  // Get ref setter for an input
  const getRefSetter = (0, _react.useCallback)(index => {
    return el => {
      inputRefs.current[index] = el;
    };
  }, []);
  return {
    inputRefs,
    focusInput,
    focusNextInput,
    focusPrevInput,
    getRefSetter
  };
};
exports.usePinInputRefs = usePinInputRefs;
var _default = exports.default = usePinInputRefs;