'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Grid = _interopRequireDefault(require("./Grid"));
var _utils = require("../internals/utils");
var _date = require("../internals/utils/date");
var _hooks = require("../internals/hooks");
var _hooks2 = require("./hooks");
var _getAriaLabel = require("./utils/getAriaLabel");
/**
 * The calendar month view, i.e. grid of dates.
 */
const CalendarBody = (0, _utils.forwardRef)((props, ref) => {
  const {
    yearMonth,
    as: Component = 'div',
    className,
    classPrefix = 'calendar-body',
    ...rest
  } = props;
  const {
    locale: overrideLocale,
    weekStart
  } = (0, _hooks2.useCalendar)();
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const locale = getLocale('Calendar', overrideLocale);
  const getAriaLabelForMonth = (0, _getAriaLabel.useGetAriaLabelForMonth)();
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(_Grid.default, {
    rows: (0, _date.getWeekStartDates)(yearMonth, {
      weekStart,
      locale: locale === null || locale === void 0 ? void 0 : locale.dateLocale
    }),
    "aria-label": getAriaLabelForMonth(yearMonth)
  }));
});
CalendarBody.displayName = 'CalendarBody';
var _default = exports.default = CalendarBody;