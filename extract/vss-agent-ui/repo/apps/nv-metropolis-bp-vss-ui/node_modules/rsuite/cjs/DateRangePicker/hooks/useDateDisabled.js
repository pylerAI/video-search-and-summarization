'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useDateDisabled = useDateDisabled;
var _react = require("react");
/**
 * Returns a function that determines whether a date is disabled and is compatible with the deprecated `disabledDate` prop.
 */
function useDateDisabled(props) {
  const {
    shouldDisableDate
  } = props;
  const isDateDisabled = (0, _react.useCallback)((date, options) => {
    const {
      selectDate,
      selectedDone,
      target
    } = options;
    if (typeof shouldDisableDate === 'function') {
      return shouldDisableDate(date, selectDate, selectedDone, target);
    }
    return false;
  }, [shouldDisableDate]);
  if (shouldDisableDate) {
    return isDateDisabled;
  }
  return undefined;
}
var _default = exports.default = useDateDisabled;