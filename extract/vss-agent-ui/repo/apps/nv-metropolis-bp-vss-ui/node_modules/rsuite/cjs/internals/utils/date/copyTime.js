'use client';
"use strict";

exports.__esModule = true;
exports.copyTime = copyTime;
exports.default = void 0;
var _getHours = require("date-fns/getHours");
var _getMinutes = require("date-fns/getMinutes");
var _getSeconds = require("date-fns/getSeconds");
var _set = require("date-fns/set");
var _isValid = require("date-fns/isValid");
/**
 * Copy the time from one date to another.
 *
 * @param from - The source date.
 * @param to - The target date.
 * @returns The target date with the time copied from the source date.
 */
function copyTime({
  from,
  to
}) {
  if (!(0, _isValid.isValid)(from) || !(0, _isValid.isValid)(to)) {
    return to;
  }
  return (0, _set.set)(to, {
    hours: (0, _getHours.getHours)(from),
    minutes: (0, _getMinutes.getMinutes)(from),
    seconds: (0, _getSeconds.getSeconds)(from)
  });
}
var _default = exports.default = copyTime;