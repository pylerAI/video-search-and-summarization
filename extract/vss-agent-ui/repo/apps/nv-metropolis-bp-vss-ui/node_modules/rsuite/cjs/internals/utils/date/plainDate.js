'use client';
"use strict";

exports.__esModule = true;
exports.addDays = addDays;
exports.compare = compare;
exports.equals = equals;
exports.isEveryDayInMonth = isEveryDayInMonth;
exports.isSameDay = isSameDay;
exports.plainYearMonthToString = plainYearMonthToString;
exports.toPlainDateTime = toPlainDateTime;
function toPlainDate(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
}
function toPlainDateTime(date) {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
    hour: date.getHours(),
    minute: date.getMinutes(),
    second: date.getSeconds()
  };
}

/**
 * Resembles the behavior of `Temporal.PlainDate.compare`.
 *
 * @see https://tc39.es/proposal-temporal/docs/plaindatetime.html#compare
 */
function compare(date1, date2) {
  if (date1.year < date2.year) return -1;
  if (date1.year > date2.year) return 1;
  if (date1.month < date2.month) return -1;
  if (date1.month > date2.month) return 1;
  if (date1.day < date2.day) return -1;
  if (date1.day > date2.day) return 1;
  return 0;
}

/**
 * Resembles the behavior of `Temporal.PlainDate.prototype.equals`.
 *
 * @see https://tc39.es/proposal-temporal/docs/plaindatetime.html#equals
 */
function equals(date1, date2) {
  return compare(date1, date2) === 0;
}
function isSameDay(date, jsDate) {
  // If jsDate is an invalid date, always return false
  if (Number.isNaN(jsDate.valueOf())) return false;
  return equals(date, toPlainDate(jsDate));
}
function addDays(date, days) {
  const jsDate = new Date(date.year, date.month - 1, date.day);
  jsDate.setDate(jsDate.getDate() + days);
  return toPlainDate(jsDate);
}

/**
 * Resembles the behavior of `Temporal.PlainYearMonth.prototype.toString`.
 *
 * @example
 * plainYearMonthToString({ year: 2025, month: 9 }); // => '2025-09'
 *
 * @see https://tc39.es/proposal-temporal/docs/plainyearmonth.html#toString
 */
function plainYearMonthToString(yearMonth) {
  return `${yearMonth.year}-${String(yearMonth.month).padStart(2, '0')}`;
}

/**
 * Gives the number of days in the month.
 * This is 28, 29, 30, or 31, depending on the month and whether the year is a leap year.
 *
 * Resembles the behavior of `Temporal.PlainYearMonth.prototype.daysInMonth`.
 *
 * @see https://tc39.es/proposal-temporal/docs/plainyearmonth.html#daysInMonth
 */
function getDaysInMonth(yearMonth) {
  return new Date(yearMonth.year, yearMonth.month - 1, 0).getDate();
}
function isEveryDayInMonth(yearMonth, predicate) {
  const daysInMonth = getDaysInMonth(yearMonth);
  for (let day = 1; day <= daysInMonth; day++) {
    if (!predicate({
      ...yearMonth,
      day
    })) {
      return false;
    }
  }
  return true;
}