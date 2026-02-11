'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useCalendarHandlers = useCalendarHandlers;
var _react = require("react");
var _hooks = require("../../internals/hooks");
var _date = require("../../internals/utils/date");
function useCalendarHandlers({
  index,
  calendarDateRange,
  onChangeCalendarMonth,
  onChangeCalendarTime,
  onSelect
}) {
  const calendarDate = (0, _react.useMemo)(() => calendarDateRange[index], [calendarDateRange, index]);
  const handleSelect = (0, _hooks.useEventCallback)((date, event) => {
    onSelect === null || onSelect === void 0 || onSelect(index, date, event);
  });
  const handleChangeMonth = (0, _hooks.useEventCallback)(nextPageDate => {
    onChangeCalendarMonth === null || onChangeCalendarMonth === void 0 || onChangeCalendarMonth(index, nextPageDate);
  });
  const handleChangeTime = (0, _hooks.useEventCallback)(nextPageDate => {
    onChangeCalendarTime === null || onChangeCalendarTime === void 0 || onChangeCalendarTime(index, nextPageDate);
  });
  const handleMoveForward = (0, _hooks.useEventCallback)(() => {
    onChangeCalendarMonth === null || onChangeCalendarMonth === void 0 || onChangeCalendarMonth(index, (0, _date.addMonths)(calendarDate, 1));
  });
  const handleMoveBackward = (0, _hooks.useEventCallback)(() => {
    onChangeCalendarMonth === null || onChangeCalendarMonth === void 0 || onChangeCalendarMonth(index, (0, _date.addMonths)(calendarDate, -1));
  });
  return {
    calendarDate,
    onSelect: handleSelect,
    onChangeMonth: handleChangeMonth,
    onChangeTime: handleChangeTime,
    onMoveForward: handleMoveForward,
    onMoveBackward: handleMoveBackward
  };
}
var _default = exports.default = useCalendarHandlers;