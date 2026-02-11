'use client';
"use strict";

exports.__esModule = true;
exports.calendarOnlyProps = exports.TimeProp = void 0;
let TimeProp = exports.TimeProp = /*#__PURE__*/function (TimeProp) {
  TimeProp["DisabledHours"] = "disabledHours";
  TimeProp["DisabledMinutes"] = "disabledMinutes";
  TimeProp["DisabledSeconds"] = "disabledSeconds";
  TimeProp["ShouldDisableHour"] = "shouldDisableHour";
  TimeProp["ShouldDisableMinute"] = "shouldDisableMinute";
  TimeProp["ShouldDisableSecond"] = "shouldDisableSecond";
  TimeProp["HideHours"] = "hideHours";
  TimeProp["HideMinutes"] = "hideMinutes";
  TimeProp["HideSeconds"] = "hideSeconds";
  return TimeProp;
}({});
const calendarOnlyProps = exports.calendarOnlyProps = [TimeProp.DisabledHours, TimeProp.DisabledMinutes, TimeProp.DisabledSeconds, TimeProp.HideHours, TimeProp.HideMinutes, TimeProp.HideSeconds];

/**
 * Represents a date on the calendar.
 *
 * Resembles Temporal.PlainDate
 * @see https://tc39.es/proposal-temporal/docs/plaindate.html
 */

/**
 * Resembles Temporal.PlainYearMonth
 *
 * @see https://tc39.es/proposal-temporal/docs/plainyearmonth.html
 */

/**
 * Resembles Temporal.PlainTime
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainTime
 */

/**
 * Resembles Temporal.PlainDateTime
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/PlainDateTime
 */