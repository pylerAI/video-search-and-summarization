'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ArrowUp = _interopRequireDefault(require("@rsuite/icons/ArrowUp"));
var _MonthDropdown = _interopRequireDefault(require("./MonthDropdown"));
var _TimeDropdown = _interopRequireDefault(require("./TimeDropdown"));
var _CalendarBody = _interopRequireDefault(require("./CalendarBody"));
var _CalendarHeader = _interopRequireDefault(require("./CalendarHeader"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _date = require("../internals/utils/date");
var _CalendarProvider = require("./CalendarProvider");
var _hooks2 = require("./hooks");
var _plainDate = require("../internals/utils/date/plainDate");
var _disableTime = require("../internals/utils/date/disableTime");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const CalendarContainer = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar',
    calendarDate: calendarDateProp,
    dateRange,
    disabledBackward,
    defaultState,
    disabledForward,
    format,
    hoverRangeValue,
    inline,
    isoWeek = false,
    weekStart,
    targetId,
    limitEndYear,
    limitStartYear,
    locale,
    monthDropdownProps,
    showMeridiem,
    showWeekNumbers,
    cellClassName: cellClassNameProp,
    disabledDate,
    onChangeMonth,
    onChangeTime,
    onMouseMove: onMouseMoveProp,
    onMoveBackward,
    onMoveForward,
    onSelect: onSelectProp,
    onToggleMonthDropdown,
    onToggleTimeDropdown,
    renderCell: renderCellProp,
    renderCellOnPicker: renderCellOnPickerProp,
    renderTitle,
    renderToolbar,
    ...rest
  } = props;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const calendarDate = (0, _react.useMemo)(() => {
    return (0, _date.isValid)(calendarDateProp) ? calendarDateProp : (0, _date.startOfToday)();
  }, [calendarDateProp]);
  const {
    calendarState,
    reset,
    handlers
  } = (0, _hooks2.useCalendarState)({
    defaultState,
    calendarDate,
    onMoveForward,
    onMoveBackward,
    onToggleTimeDropdown,
    onToggleMonthDropdown
  });
  const isDateDisabled = (0, _react.useCallback)(date => {
    var _disabledDate;
    return (_disabledDate = disabledDate === null || disabledDate === void 0 ? void 0 : disabledDate(toJsDate(date))) !== null && _disabledDate !== void 0 ? _disabledDate : false;
  }, [disabledDate]);
  const isMonthDisabled = (0, _react.useCallback)(yearMonth => {
    return (0, _plainDate.isEveryDayInMonth)(yearMonth, isDateDisabled);
  }, [isDateDisabled]);
  const handleCloseDropdown = (0, _hooks.useEventCallback)(() => reset());
  const {
    mode,
    has
  } = (0, _date.useDateMode)(format);
  const timeMode = calendarState === _hooks2.CalendarState.TIME || mode === _date.DateMode.Time;
  const monthMode = calendarState === _hooks2.CalendarState.MONTH || mode === _date.DateMode.Month;
  const calendarClasses = merge(className, withPrefix({
    'time-view': timeMode,
    'month-view': monthMode,
    'only-time': mode === _date.DateMode.Time,
    'show-week-numbers': showWeekNumbers
  }));
  const timeDropdownProps = useTimeDropdownProps(rest);
  const isDateTimeDisabled = (0, _disableTime.useIsDateTimeDisabled)(timeDropdownProps);
  const isTimeDisabled = (0, _react.useCallback)(date => isDateTimeDisabled((0, _plainDate.toPlainDateTime)(date)), [isDateTimeDisabled]);
  const handleChangeMonth = (0, _hooks.useEventCallback)((yearMonth, event) => {
    reset();
    // Call `onChangeMonth` with the first day in the month
    onChangeMonth === null || onChangeMonth === void 0 || onChangeMonth(new Date(yearMonth.year, yearMonth.month - 1, 1), event);
  });
  const cellClassName = (0, _react.useCallback)(date => cellClassNameProp === null || cellClassNameProp === void 0 ? void 0 : cellClassNameProp(toJsDate(date)), [cellClassNameProp]);
  const onMouseMove = (0, _react.useCallback)(date => onMouseMoveProp === null || onMouseMoveProp === void 0 ? void 0 : onMouseMoveProp(toJsDate(date)), [onMouseMoveProp]);
  const onSelect = (0, _react.useCallback)((date, event) => onSelectProp === null || onSelectProp === void 0 ? void 0 : onSelectProp(toJsDate(date), event), [onSelectProp]);
  const renderCell = (0, _react.useCallback)(date => renderCellProp === null || renderCellProp === void 0 ? void 0 : renderCellProp(toJsDate(date)), [renderCellProp]);
  const renderCellOnPicker = (0, _react.useCallback)(date => renderCellOnPickerProp === null || renderCellOnPickerProp === void 0 ? void 0 : renderCellOnPickerProp(toJsDate(date)), [renderCellOnPickerProp]);
  const handleChangeTime = (0, _hooks.useEventCallback)((time, event) => {
    let nextDate = calendarDate || (0, _date.startOfToday)();
    nextDate = (0, _date.setHours)(nextDate, time.hour);
    nextDate = (0, _date.setMinutes)(nextDate, time.minute);
    nextDate = (0, _date.setSeconds)(nextDate, time.second);
    onChangeTime === null || onChangeTime === void 0 || onChangeTime(nextDate, event);
  });
  const contextValue = {
    date: calendarDate,
    dateRange,
    format,
    hoverRangeValue,
    inline,
    isoWeek,
    weekStart,
    targetId,
    locale,
    showWeekNumbers,
    monthDropdownProps,
    cellClassName,
    disabledDate: isDateDisabled,
    onChangeMonth: handleChangeMonth,
    onChangeTime: handleChangeTime,
    onMouseMove,
    onSelect,
    renderCell: typeof renderCellProp === 'undefined' ? undefined : renderCell,
    renderCellOnPicker: typeof renderCellOnPickerProp === 'undefined' ? undefined : renderCellOnPicker
  };
  const currentViewingMonth = (0, _react.useMemo)(() => {
    return {
      year: calendarDate.getFullYear(),
      month: calendarDate.getMonth() + 1
    };
  }, [calendarDate]);
  return /*#__PURE__*/_react.default.createElement(_CalendarProvider.CalendarProvider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    "data-testid": "calendar"
  }, (0, _date.omitHideDisabledProps)(rest), {
    className: calendarClasses,
    ref: ref
  }), mode !== _date.DateMode.Time && /*#__PURE__*/_react.default.createElement(_CalendarHeader.default, (0, _extends2.default)({}, handlers, {
    showMonth: has('month'),
    showDate: has('day'),
    showTime: has('time'),
    disabledTime: isTimeDisabled,
    renderTitle: renderTitle,
    renderToolbar: renderToolbar,
    disabledBackward: disabledBackward,
    disabledForward: disabledForward
  })), has('day') && /*#__PURE__*/_react.default.createElement(_CalendarBody.default, {
    yearMonth: currentViewingMonth
  }), has('month') && /*#__PURE__*/_react.default.createElement(_MonthDropdown.default, {
    show: monthMode,
    limitEndYear: limitEndYear,
    limitStartYear: limitStartYear,
    isMonthDisabled: isMonthDisabled
  }), has('time') && /*#__PURE__*/_react.default.createElement(_TimeDropdown.default, (0, _extends2.default)({}, timeDropdownProps, {
    show: timeMode,
    showMeridiem: showMeridiem
  })), (monthMode || timeMode) && has('day') && /*#__PURE__*/_react.default.createElement("button", {
    className: prefix('btn-close'),
    onClick: handleCloseDropdown,
    "aria-label": `Collapse ${monthMode ? 'month' : 'time'} view`
  }, /*#__PURE__*/_react.default.createElement(_ArrowUp.default, null))));
});
CalendarContainer.displayName = 'CalendarContainer';
var _default = exports.default = CalendarContainer;
/**
 * Convert the `hide*` and `disabled*` props from CalendarProps to handle PlainDate instead of Date,
 * to be passed to TimeDropdown.
 */
function useTimeDropdownProps(calendarProps) {
  const {
    hideHours,
    hideMinutes,
    hideSeconds,
    disabledHours,
    disabledMinutes,
    disabledSeconds
  } = calendarProps;
  return (0, _react.useMemo)(() => ({
    hideHours: (hour, date) => {
      var _hideHours;
      return (_hideHours = hideHours === null || hideHours === void 0 ? void 0 : hideHours(hour, toJsDate(date))) !== null && _hideHours !== void 0 ? _hideHours : false;
    },
    hideMinutes: (minute, date) => {
      var _hideMinutes;
      return (_hideMinutes = hideMinutes === null || hideMinutes === void 0 ? void 0 : hideMinutes(minute, toJsDate(date))) !== null && _hideMinutes !== void 0 ? _hideMinutes : false;
    },
    hideSeconds: (second, date) => {
      var _hideSeconds;
      return (_hideSeconds = hideSeconds === null || hideSeconds === void 0 ? void 0 : hideSeconds(second, toJsDate(date))) !== null && _hideSeconds !== void 0 ? _hideSeconds : false;
    },
    disabledHours: (hour, date) => {
      var _disabledHours;
      return (_disabledHours = disabledHours === null || disabledHours === void 0 ? void 0 : disabledHours(hour, toJsDate(date))) !== null && _disabledHours !== void 0 ? _disabledHours : false;
    },
    disabledMinutes: (minute, date) => {
      var _disabledMinutes;
      return (_disabledMinutes = disabledMinutes === null || disabledMinutes === void 0 ? void 0 : disabledMinutes(minute, toJsDate(date))) !== null && _disabledMinutes !== void 0 ? _disabledMinutes : false;
    },
    disabledSeconds: (second, date) => {
      var _disabledSeconds;
      return (_disabledSeconds = disabledSeconds === null || disabledSeconds === void 0 ? void 0 : disabledSeconds(second, toJsDate(date))) !== null && _disabledSeconds !== void 0 ? _disabledSeconds : false;
    }
  }), [hideHours, hideMinutes, hideSeconds, disabledHours, disabledMinutes, disabledSeconds]);
}
function toJsDate(date) {
  return new Date(date.year, date.month - 1, date.day);
}