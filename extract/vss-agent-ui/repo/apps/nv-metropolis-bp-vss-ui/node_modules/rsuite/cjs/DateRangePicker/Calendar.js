'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _CalendarContainer = _interopRequireDefault(require("../Calendar/CalendarContainer"));
var _utils = require("../internals/utils");
var _date = require("../internals/utils/date");
var _constants = require("../internals/constants");
var _hooks = require("./hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Calendar = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = _CalendarContainer.default,
    calendarDateRange = [(0, _date.startOfToday)(), (0, _date.addMonths)((0, _date.startOfToday)(), 1)],
    format = 'yyyy-MM-dd',
    disabledDate,
    index = 0,
    limitEndYear,
    limitStartYear,
    onChangeCalendarMonth,
    onChangeCalendarTime,
    onSelect,
    renderTitle,
    value = [],
    ...rest
  } = props;
  const calendarKey = index === 0 ? 'start' : 'end';
  const calendarHandlers = (0, _hooks.useCalendarHandlers)({
    index,
    calendarDateRange,
    onChangeCalendarMonth,
    onChangeCalendarTime,
    onSelect
  });
  const disableCalendarDate = (0, _react.useCallback)(date => {
    return disabledDate === null || disabledDate === void 0 ? void 0 : disabledDate(date, value, _constants.DATERANGE_DISABLED_TARGET.CALENDAR);
  }, [disabledDate, value]);
  const handleRenderTitle = (0, _react.useCallback)(date => {
    return renderTitle === null || renderTitle === void 0 ? void 0 : renderTitle(date, calendarKey);
  }, [renderTitle, calendarKey]);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    "data-testid": `calendar-${calendarKey}`
  }, rest, calendarHandlers, {
    index: index,
    format: format,
    dateRange: value,
    disabledDate: disableCalendarDate,
    limitEndYear: limitEndYear,
    limitStartYear: limitStartYear,
    renderTitle: handleRenderTitle,
    ref: ref
  }));
});
Calendar.displayName = 'DateRangePicker.Calendar';
var _default = exports.default = Calendar;