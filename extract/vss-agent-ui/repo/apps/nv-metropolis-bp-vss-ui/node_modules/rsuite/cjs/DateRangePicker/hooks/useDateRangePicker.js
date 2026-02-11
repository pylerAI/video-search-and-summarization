'use client';
"use strict";

exports.__esModule = true;
exports.useDateRangePicker = void 0;
var _react = require("react");
var _DateRangePickerProvider = require("../DateRangePickerProvider");
const useDateRangePicker = () => {
  return (0, _react.useContext)(_DateRangePickerProvider.DateRangePickerContext) || {};
};
exports.useDateRangePicker = useDateRangePicker;