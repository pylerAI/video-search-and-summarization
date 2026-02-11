'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _CalendarContainer = _interopRequireDefault(require("./CalendarContainer"));
var _Button = _interopRequireDefault(require("../Button"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _date = require("../internals/utils/date");
var _FormattedDate = require("../internals/intl/FormattedDate");
var _hooks = require("../internals/hooks");
var _hooks2 = require("./hooks");
/**
 * The Calendar component is used to select dates.
 * @see https://rsuitejs.com/components/calendar
 */
const Calendar = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Calendar', props);
  const {
    as = _CalendarContainer.default,
    bordered,
    className,
    classPrefix = 'calendar',
    compact,
    defaultValue = (0, _date.startOfDay)(new Date()),
    isoWeek,
    weekStart,
    locale,
    cellClassName,
    onChange,
    onMonthChange,
    onSelect,
    renderCell,
    value,
    ...rest
  } = propsWithDefaults;
  const {
    calendarDate,
    setCalendarDate
  } = (0, _hooks2.useCalendarDate)(value, defaultValue);
  const handleChange = (0, _hooks.useEventCallback)(nextValue => {
    setCalendarDate(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue);
    if (!(0, _date.isSameMonth)(nextValue, calendarDate)) {
      onMonthChange === null || onMonthChange === void 0 || onMonthChange(nextValue);
    }
  });
  const handleClickToday = (0, _hooks.useEventCallback)(() => {
    handleChange(new Date());
  });
  const handleSelect = (0, _hooks.useEventCallback)(nextValue => {
    onSelect === null || onSelect === void 0 || onSelect(nextValue);
    handleChange(nextValue);
  });
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const renderToolbar = () => /*#__PURE__*/_react.default.createElement(_Button.default, {
    className: prefix('btn-today'),
    size: "sm",
    onClick: handleClickToday
  }, (locale === null || locale === void 0 ? void 0 : locale.today) || 'Today');
  const renderTitle = date => /*#__PURE__*/_react.default.createElement(_FormattedDate.FormattedDate, {
    date: date,
    formatStr: (locale === null || locale === void 0 ? void 0 : locale.formattedMonthPattern) || 'MMMM  yyyy'
  });
  const classes = merge(className, prefix('panel', {
    bordered,
    compact
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({}, rest, {
    as: as,
    inline: true,
    className: classes,
    ref: ref,
    isoWeek: isoWeek,
    weekStart: weekStart,
    format: "yyyy-MM-dd",
    calendarDate: calendarDate,
    limitEndYear: 1000,
    locale: locale,
    renderTitle: renderTitle,
    renderToolbar: renderToolbar,
    renderCell: renderCell,
    cellClassName: cellClassName,
    onMoveForward: handleChange,
    onMoveBackward: handleChange,
    onChangeMonth: handleChange,
    onSelect: handleSelect
  }));
});
Calendar.displayName = 'Calendar';
var _default = exports.default = Calendar;