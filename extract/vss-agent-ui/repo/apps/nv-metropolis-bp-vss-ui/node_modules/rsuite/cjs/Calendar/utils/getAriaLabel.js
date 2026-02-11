'use client';
"use strict";

exports.__esModule = true;
exports.getAriaLabel = getAriaLabel;
exports.useGetAriaLabelForMonth = useGetAriaLabelForMonth;
var _react = require("react");
var _date = require("../../internals/utils/date");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
/**
 * Get aria-label for the date.
 * @param date - The date.
 * @param formatStr - The format string.
 * @param format - The format function.
 */
function getAriaLabel(date, formatStr, format) {
  return format ? format(date, formatStr) : (0, _date.format)(date, formatStr);
}
function useGetAriaLabelForMonth() {
  const {
    locale: overrideLocale
  } = (0, _hooks2.useCalendar)();
  const {
    getLocale,
    formatDate
  } = (0, _hooks.useCustom)('Calendar');
  const {
    formattedMonthPattern
  } = (0, _react.useMemo)(() => getLocale('Calendar', overrideLocale), [getLocale, overrideLocale]);
  return (0, _react.useCallback)(month => formatDate(new Date(month.year, month.month - 1, 1), formattedMonthPattern), [formatDate, formattedMonthPattern]);
}