'use client';
"use strict";

exports.__esModule = true;
exports.after = after;
exports.afterToday = afterToday;
exports.allowedDays = allowedDays;
exports.allowedMaxDays = allowedMaxDays;
exports.allowedRange = allowedRange;
exports.before = before;
exports.beforeToday = beforeToday;
exports.combine = combine;
var _utils = require("../internals/utils");
var DateUtils = _interopRequireWildcard(require("../internals/utils/date"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function isAfterDay(date1, date2) {
  return DateUtils.isAfter(new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()), new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
}
function isBeforeDay(date1, date2) {
  return DateUtils.isBefore(new Date(date1.getFullYear(), date1.getMonth(), date1.getDate()), new Date(date2.getFullYear(), date2.getMonth(), date2.getDate()));
}

/**
 Allow the maximum number of days specified, other dates are disabled.
 */
function allowedMaxDays(days) {
  return (date, selectValue, selectedDone, target) => {
    let beforeLimit = false;
    let afterLimit = false;
    if (selectValue !== null && selectValue !== void 0 && selectValue[0]) {
      const startDate = selectValue[0];
      beforeLimit = (0, _utils.composeFunctions)(f => DateUtils.addDays(f, -days + 1), f => isAfterDay(f, date))(startDate);
      afterLimit = (0, _utils.composeFunctions)(f => DateUtils.addDays(f, days - 1), f => isBeforeDay(f, date))(startDate);
    }
    if (target === 'CALENDAR' && !selectedDone && (beforeLimit || afterLimit)) {
      return true;
    }
    return false;
  };
}

/**
 * Only allowed days are specified, other dates are disabled.
 */
function allowedDays(days) {
  return (date, selectValue, selectedDone, target) => {
    let beforeLimit = false;
    let afterLimit = false;
    if (selectValue !== null && selectValue !== void 0 && selectValue[0]) {
      const startDate = selectValue[0];
      beforeLimit = (0, _utils.composeFunctions)(f => DateUtils.addDays(f, -days + 1), f => !DateUtils.isSameDay(f, date))(startDate);
      afterLimit = (0, _utils.composeFunctions)(f => DateUtils.addDays(f, days - 1), f => !DateUtils.isSameDay(f, date))(startDate);
    }
    if (target === 'CALENDAR' && !selectedDone && beforeLimit && afterLimit) {
      return true;
    }
    return false;
  };
}

/**
 Allow specified date range, other dates are disabled.
 */
function allowedRange(startDate, endDate) {
  return date => {
    if (isBeforeDay(date, new Date(startDate)) || isAfterDay(date, new Date(endDate))) {
      return true;
    }
    return false;
  };
}

/**
 Disable dates after the specified date.
 */
function before(beforeDate = new Date()) {
  return date => {
    if (isBeforeDay(date, new Date(beforeDate))) {
      return true;
    }
    return false;
  };
}

/**
 Disable dates before the specified date.
 */
function after(afterDate = new Date()) {
  return date => {
    if (isAfterDay(date, new Date(afterDate))) {
      return true;
    }
    return false;
  };
}

/**
 Disable dates after today.
 */
function beforeToday() {
  return before();
}

/**
 Disable dates before today.
 */
function afterToday() {
  return after();
}

/**
 Used to combine multiple conditions.
 */
function combine(...args) {
  return (...disabledDateArgs) => {
    return args.reduce((a, b) => a(...disabledDateArgs) || b(...disabledDateArgs));
  };
}