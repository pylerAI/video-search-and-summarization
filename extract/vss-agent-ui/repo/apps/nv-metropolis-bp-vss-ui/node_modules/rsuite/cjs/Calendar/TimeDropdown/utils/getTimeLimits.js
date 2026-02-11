'use client';
"use strict";

exports.__esModule = true;
exports.getTimeLimits = getTimeLimits;
function getTimeLimits(isMeridiem) {
  const HOURS_24H = {
    start: 0,
    end: 23
  };
  const HOURS_12H = {
    start: 0,
    end: 11
  };
  const MINUTES_SECONDS = {
    start: 0,
    end: 59
  };
  return {
    hours: isMeridiem ? HOURS_12H : HOURS_24H,
    minutes: MINUTES_SECONDS,
    seconds: MINUTES_SECONDS
  };
}