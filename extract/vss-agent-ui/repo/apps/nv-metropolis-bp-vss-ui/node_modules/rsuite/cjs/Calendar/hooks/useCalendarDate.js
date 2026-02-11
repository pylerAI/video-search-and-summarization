'use client';
"use strict";

exports.__esModule = true;
exports.useCalendarDate = void 0;
var _react = require("react");
var _hooks = require("../../internals/hooks");
var _date = require("../../internals/utils/date");
const useCalendarDate = (value, defaultDate) => {
  var _ref;
  const valueRef = (0, _react.useRef)(value);
  const [calendarDate, setValue] = (0, _react.useState)((_ref = value !== null && value !== void 0 ? value : defaultDate) !== null && _ref !== void 0 ? _ref : (0, _date.startOfToday)());
  const setCalendarDate = (0, _react.useCallback)(date => {
    if (date && (date === null || date === void 0 ? void 0 : date.valueOf()) !== (calendarDate === null || calendarDate === void 0 ? void 0 : calendarDate.valueOf())) {
      setValue(date);
    }
  }, [calendarDate]);
  const resetCalendarDate = (0, _react.useCallback)((nextValue = value) => {
    var _ref2;
    setValue((_ref2 = nextValue !== null && nextValue !== void 0 ? nextValue : defaultDate) !== null && _ref2 !== void 0 ? _ref2 : (0, _date.startOfToday)());
  }, [defaultDate, value]);
  (0, _hooks.useUpdateEffect)(() => {
    var _valueRef$current;
    if ((value === null || value === void 0 ? void 0 : value.valueOf()) !== ((_valueRef$current = valueRef.current) === null || _valueRef$current === void 0 ? void 0 : _valueRef$current.valueOf())) {
      var _ref3;
      setCalendarDate((_ref3 = value !== null && value !== void 0 ? value : defaultDate) !== null && _ref3 !== void 0 ? _ref3 : (0, _date.startOfToday)());
      valueRef.current = value;
    }
  }, [value, defaultDate]);
  return {
    calendarDate,
    setCalendarDate,
    resetCalendarDate
  };
};
exports.useCalendarDate = useCalendarDate;