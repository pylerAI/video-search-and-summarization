'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useFieldCursor = useFieldCursor;
var _react = require("react");
var _utils = require("../utils");
var _hooks = require("../../internals/hooks");
function useFieldCursor(format, value) {
  const typeCount = (0, _react.useRef)(0);
  const increment = (0, _react.useCallback)(() => {
    typeCount.current += 1;
  }, []);
  const reset = (0, _react.useCallback)(() => {
    typeCount.current = 0;
  }, []);
  const isResetValue = (0, _react.useCallback)(() => {
    return typeCount.current === 0;
  }, []);

  // Check if the cursor should move to the next field
  const isMoveCursor = (0, _react.useCallback)((value, pattern) => {
    const patternGroup = (0, _utils.getPatternGroups)(format, pattern);
    if (value.toString().length === patternGroup.length) {
      return true;
    } else if (pattern === 'y' && typeCount.current === 4) {
      return true;
    } else if (pattern !== 'y' && typeCount.current === 2) {
      return true;
    }
    switch (pattern) {
      case 'M':
        return parseInt(`${value}0`) > 12;
      case 'd':
        return parseInt(`${value}0`) > 31;
      case 'H':
        return parseInt(`${value}0`) > 23;
      case 'h':
        return parseInt(`${value}0`) > 12;
      case 'm':
      case 's':
        return parseInt(`${value}0`) > 59;
      default:
        return false;
    }
  }, [format]);
  (0, _hooks.useUpdateEffect)(() => {
    if (!value) {
      reset();
    }
  }, [value]);
  return {
    increment,
    reset,
    isMoveCursor,
    isResetValue
  };
}
var _default = exports.default = useFieldCursor;