'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _GridCell = _interopRequireDefault(require("./GridCell"));
var _utils = require("../../internals/utils");
var _date = require("../../internals/utils/date");
var _constants = require("../../internals/constants");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
var _plainDate = require("../../internals/utils/date/plainDate");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A row in the calendar month view grid, i.e. a week of days.
 */

const GridRow = (0, _utils.forwardRef)((props, ref) => {
  var _locale$dateLocale$op, _locale$dateLocale;
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-table',
    startingDate,
    rowIndex,
    ...rest
  } = props;
  const {
    date: selected = new Date(),
    dateRange,
    hoverRangeValue,
    isoWeek,
    weekStart,
    showWeekNumbers,
    locale,
    disabledDate,
    onSelect
  } = (0, _hooks2.useCalendar)();
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const handleSelect = (0, _react.useCallback)((date, disabled, event) => {
    // TODO: Doma - Consider moving this check for `disabled` into GridCell
    if (disabled) {
      return;
    }
    onSelect === null || onSelect === void 0 || onSelect(date, event);
  }, [onSelect]);
  const renderDays = () => {
    const days = [];
    // The start and end dates of the range selection
    // Note that they can be
    // - Invalid date - when the user is inputting the date with text input
    // - undefined - when the range selection isn't completed
    const [selectedStartDateJS, selectedEndDateJS] = dateRange || [];
    const [hoverStartDateJS, hoverEndDateJS] = hoverRangeValue !== null && hoverRangeValue !== void 0 ? hoverRangeValue : [];
    const isRangeSelectionMode = typeof dateRange !== 'undefined';
    const plainDateRange = typeof dateRange !== 'undefined' ? dateRange.map(d => d instanceof Date ? {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate()
    } : undefined) : undefined;
    for (let i = 0; i < 7; i += 1) {
      const thisDate = (0, _plainDate.addDays)(startingDate, i);
      const thisDateJS = new Date(thisDate.year, thisDate.month - 1, thisDate.day);
      const disabled = disabledDate === null || disabledDate === void 0 ? void 0 : disabledDate(thisDate, plainDateRange, _constants.DATERANGE_DISABLED_TARGET.CALENDAR);

      // Whether this date is in a different month from the selected date
      const isSameMonth = selected.getFullYear() === thisDate.year && selected.getMonth() + 1 === thisDate.month;

      // Whether this date is the range start date and is in the same month with the selected date
      const isRangeStart = isSameMonth && selectedStartDateJS && (0, _plainDate.isSameDay)(thisDate, selectedStartDateJS);

      // Whether this date is the range end date and is in the same month with the selected date
      const isRangeEnd = isSameMonth && selectedEndDateJS && (0, _plainDate.isSameDay)(thisDate, selectedEndDateJS);

      // Whether this date should be displayed in the "selected" state
      // Either
      // - In range selection mode, it's either the range start or end date
      // - Otherwise, it's the selected date itself
      const isSelected = isRangeSelectionMode ? isRangeStart || isRangeEnd : (0, _plainDate.isSameDay)(thisDate, selected);

      // TODO-Doma Move those logic that's for DatePicker/DateRangePicker to a separate component
      //           Calendar is not supposed to be reused this way
      let inRange = false;
      // for Selected
      if (selectedStartDateJS && selectedEndDateJS) {
        const selectedStartDate = {
          year: selectedStartDateJS.getFullYear(),
          month: selectedStartDateJS.getMonth() + 1,
          day: selectedStartDateJS.getDate()
        };
        const selectedEndDate = {
          year: selectedEndDateJS.getFullYear(),
          month: selectedEndDateJS.getMonth() + 1,
          day: selectedEndDateJS.getDate()
        };
        if ((0, _plainDate.compare)(thisDate, selectedEndDate) < 0 && (0, _plainDate.compare)(thisDate, selectedStartDate) > 0) {
          inRange = true;
        }
        if ((0, _plainDate.compare)(thisDate, selectedStartDate) < 0 && (0, _plainDate.compare)(thisDate, selectedEndDate) > 0) {
          inRange = true;
        }
      }

      // for Hovering
      if (!isSelected && hoverStartDateJS && hoverEndDateJS) {
        const hoverStartDate = {
          year: hoverStartDateJS.getFullYear(),
          month: hoverStartDateJS.getMonth() + 1,
          day: hoverStartDateJS.getDate()
        };
        const hoverEndDate = {
          year: hoverEndDateJS.getFullYear(),
          month: hoverEndDateJS.getMonth() + 1,
          day: hoverEndDateJS.getDate()
        };
        if ((0, _plainDate.compare)(thisDate, hoverEndDate) <= 0 && (0, _plainDate.compare)(thisDate, hoverStartDate) >= 0) {
          inRange = true;
        }
        if ((0, _plainDate.compare)(thisDate, hoverStartDate) <= 0 && (0, _plainDate.compare)(thisDate, hoverEndDate) >= 0) {
          inRange = true;
        }
      }
      days.push(/*#__PURE__*/_react.default.createElement(_GridCell.default, {
        key: (0, _date.format)(thisDateJS, 'yyyy-MM-dd'),
        date: thisDate,
        disabled: disabled,
        selected: isSelected,
        onSelect: handleSelect,
        unSameMonth: !isSameMonth,
        rangeStart: isRangeStart,
        rangeEnd: isRangeEnd,
        inRange: inRange
      }));
    }
    return days;
  };
  const classes = merge(className, prefix('row'));
  const {
    firstWeekContainsDate
  } = (_locale$dateLocale$op = locale === null || locale === void 0 || (_locale$dateLocale = locale.dateLocale) === null || _locale$dateLocale === void 0 ? void 0 : _locale$dateLocale.options) !== null && _locale$dateLocale$op !== void 0 ? _locale$dateLocale$op : {};
  // ISO week starts on Monday
  const date = isoWeek ? (0, _plainDate.addDays)(startingDate, 1) : startingDate;
  const week = (0, _date.format)(new Date(date.year, date.month - 1, date.day), isoWeek ? 'I' : 'w', {
    locale: locale === null || locale === void 0 ? void 0 : locale.dateLocale,
    firstWeekContainsDate,
    weekStartsOn: weekStart
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    role: "row",
    "aria-rowindex": rowIndex,
    className: classes
  }), showWeekNumbers && /*#__PURE__*/_react.default.createElement("div", {
    role: "rowheader",
    "aria-label": `Week ${week}`,
    className: prefix('cell-week-number')
  }, week), renderDays());
});
GridRow.displayName = 'CalendarGridRow';
var _default = exports.default = GridRow;