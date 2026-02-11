'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getDefaultRanges = getDefaultRanges;
exports.getRestProps = exports.getRanges = void 0;
exports.splitRanges = splitRanges;
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Picker = require("../internals/Picker");
var _date = require("../internals/utils/date");
function getDefaultRanges(value) {
  const today = (0, _date.startOfToday)();

  /**
   * If it is an array type, it returns the default shortcut key suitable for DateRangePicker Toolbar,
   * otherwise it returns the default shortcut key suitable for DatePicker Toolbar
   */
  if (value instanceof Array) {
    return [{
      label: 'today',
      value: [(0, _date.startOfDay)(today), (0, _date.endOfDay)(today)]
    }, {
      label: 'yesterday',
      value: [(0, _date.startOfDay)((0, _date.subDays)(today, 1)), (0, _date.endOfDay)((0, _date.subDays)(today, 1))]
    }, {
      label: 'last7Days',
      value: [(0, _date.startOfDay)((0, _date.subDays)(today, 6)), (0, _date.endOfDay)(today)]
    }];
  }
  return [{
    label: 'today',
    value: today
  }, {
    label: 'yesterday',
    value: (0, _date.subDays)(today, 1)
  }];
}
const generateRangesIterator = ({
  calendarDate
}) => ({
  value,
  ...rest
}) => ({
  value: typeof value === 'function' ? value(calendarDate) : value,
  ...rest
});

/**
 * get Toolbar ranges from Toolbar props
 * @param ranges
 * @param calendarDate
 */
const getRanges = ({
  ranges,
  calendarDate
}) => {
  return typeof ranges === 'undefined' ? getDefaultRanges(calendarDate) : ranges.map(generateRangesIterator({
    calendarDate
  }));
};
exports.getRanges = getRanges;
function splitRanges(ranges) {
  // The shortcut option on the left side of the calendar panel
  const sideRanges = ranges === null || ranges === void 0 ? void 0 : ranges.filter(range => (range === null || range === void 0 ? void 0 : range.placement) === 'left');

  // The shortcut option on the bottom of the calendar panel
  const bottomRanges = ranges === null || ranges === void 0 ? void 0 : ranges.filter(range => (range === null || range === void 0 ? void 0 : range.placement) === 'bottom' || (range === null || range === void 0 ? void 0 : range.placement) === undefined);
  return {
    sideRanges,
    bottomRanges
  };
}
const getRestProps = (props, omitProps = []) => {
  return (0, _omit.default)(props, [..._Picker.overlayPropKeys, ..._date.calendarOnlyProps, ...omitProps]);
};
exports.getRestProps = getRestProps;