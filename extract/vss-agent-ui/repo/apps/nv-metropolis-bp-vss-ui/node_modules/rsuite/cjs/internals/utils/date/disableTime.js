'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.disableTime = disableTime;
exports.useIsDateTimeDisabled = useIsDateTimeDisabled;
var _react = require("react");
var _pick = _interopRequireDefault(require("lodash/pick"));
var _getHours = require("date-fns/getHours");
var _getMinutes = require("date-fns/getMinutes");
var _getSeconds = require("date-fns/getSeconds");
var _types = require("./types");
const HOURS_PATTERN = /(Hours?)/;
const MINUTES_PATTERN = /(Minutes?)/;
const SECONDS_PATTERN = /(Seconds?)/;

/**
 * Verify that the time is valid.
 *
 * @param props - The calendar props.
 * @param date - The date to check.
 * @returns Whether the time is disabled.
 *
 * @deprecated Use {@link useIsDateTimeDisabled} which handles PlainDateTime instead.
 */
function disableTime(props, date) {
  if (!date) {
    return false;
  }
  const disabledTimeProps = [_types.TimeProp.DisabledHours, _types.TimeProp.DisabledMinutes, _types.TimeProp.DisabledSeconds, _types.TimeProp.ShouldDisableHour, _types.TimeProp.ShouldDisableMinute, _types.TimeProp.ShouldDisableSecond];
  const calendarProps = (0, _pick.default)(props, disabledTimeProps);
  const mapProps = new Map(Object.entries(calendarProps));
  return Array.from(mapProps.keys()).some(key => {
    if (HOURS_PATTERN.test(key)) {
      var _mapProps$get;
      return (_mapProps$get = mapProps.get(key)) === null || _mapProps$get === void 0 ? void 0 : _mapProps$get((0, _getHours.getHours)(date), date);
    }
    if (MINUTES_PATTERN.test(key)) {
      var _mapProps$get2;
      return (_mapProps$get2 = mapProps.get(key)) === null || _mapProps$get2 === void 0 ? void 0 : _mapProps$get2((0, _getMinutes.getMinutes)(date), date);
    }
    if (SECONDS_PATTERN.test(key)) {
      var _mapProps$get3;
      return (_mapProps$get3 = mapProps.get(key)) === null || _mapProps$get3 === void 0 ? void 0 : _mapProps$get3((0, _getSeconds.getSeconds)(date), date);
    }
    return false;
  });
}
var _default = exports.default = disableTime;
/**
 * Whether a datetime is allowed, based on the `hide*` and `disabled*` props.
 */
function useIsDateTimeDisabled(timeDropdownProps) {
  return (0, _react.useCallback)(dateTime => {
    const calendarProps = timeDropdownProps;
    const mapProps = new Map(Object.entries(calendarProps));
    const date = (0, _pick.default)(dateTime, ['year', 'month', 'day']);
    return Array.from(mapProps.keys()).some(key => {
      if (HOURS_PATTERN.test(key)) {
        var _mapProps$get4;
        return (_mapProps$get4 = mapProps.get(key)) === null || _mapProps$get4 === void 0 ? void 0 : _mapProps$get4(dateTime.hour, date);
      }
      if (MINUTES_PATTERN.test(key)) {
        var _mapProps$get5;
        return (_mapProps$get5 = mapProps.get(key)) === null || _mapProps$get5 === void 0 ? void 0 : _mapProps$get5(dateTime.minute, date);
      }
      if (SECONDS_PATTERN.test(key)) {
        var _mapProps$get6;
        return (_mapProps$get6 = mapProps.get(key)) === null || _mapProps$get6 === void 0 ? void 0 : _mapProps$get6(dateTime.second, date);
      }
      return false;
    });
  }, [timeDropdownProps]);
}