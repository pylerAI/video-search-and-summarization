'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.getWeekStartDates = getWeekStartDates;
var _startOfWeek = require("date-fns/startOfWeek");
var _plainDate = require("./plainDate");
/**
 * Get the first days of weeks in a month。
 * @param month The month
 * @param options.weekStart the index of the first day of the week (0 - Sunday)
 * @param options.isoWeek Whether to use ISO week
 * @returns A list of first days of weeks in a month
 */
function getWeekStartDates(month, options) {
  const {
    weekStart,
    locale
  } = options;
  const firstDayJs = (0, _startOfWeek.startOfWeek)(new Date(month.year, month.month - 1, 1), {
    weekStartsOn: weekStart,
    locale
  });
  const firstDay = {
    year: firstDayJs.getFullYear(),
    month: firstDayJs.getMonth() + 1,
    day: firstDayJs.getDate()
  };
  const days = [firstDay];
  for (let i = 1; i < 6; i++) {
    days.push((0, _plainDate.addDays)(firstDay, i * 7));
  }
  return days;
}
var _default = exports.default = getWeekStartDates;