'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _DateRangePicker = _interopRequireDefault(require("../DateRangePicker"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const defaultRanges = [];
const TimeRangePicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults,
    getLocale
  } = (0, _hooks.useCustom)('TimeRangePicker', props);
  const {
    shortTimeFormat
  } = getLocale('DateTimeFormats');
  return /*#__PURE__*/_react.default.createElement(_DateRangePicker.default, (0, _extends2.default)({
    ref: ref,
    showHeader: false,
    format: shortTimeFormat,
    ranges: defaultRanges
  }, propsWithDefaults));
});
TimeRangePicker.displayName = 'TimeRangePicker';
var _default = exports.default = TimeRangePicker;