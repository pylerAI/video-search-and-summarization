'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useDateInputState = useDateInputState;
var _startCase = _interopRequireDefault(require("lodash/startCase"));
var _react = require("react");
var _date = require("../../internals/utils/date");
var _hooks = require("../../internals/hooks");
var _DateField = require("../DateField");
function useDateInputState({
  formatStr,
  locale,
  date,
  isControlledDate
}) {
  const {
    formatDate
  } = (0, _hooks.useCustom)();
  const {
    dateField,
    dispatch,
    toDateString,
    toDate,
    isEmptyValue
  } = (0, _DateField.useDateField)(formatStr, locale.localize, date);
  const setDateOffset = (pattern, offset, callback) => {
    const currentDate = new Date();
    const year = dateField.year || currentDate.getFullYear();
    const month = dateField.month ? dateField.month - 1 : currentDate.getMonth();
    const day = dateField.day || 0;
    const hour = dateField.hour || 0;
    const minute = dateField.minute || 0;
    const second = dateField.second || 0;
    let actionName;
    let value;
    switch (pattern) {
      case 'y':
        actionName = 'setYear';
        value = (0, _date.addYears)(new Date(year, 0), offset).getFullYear();
        break;
      case 'M':
        actionName = 'setMonth';
        value = (0, _date.addMonths)(new Date(year, month), offset).getMonth() + 1;
        break;
      case 'd':
        {
          actionName = 'setDay';
          const prevDate = new Date(year, month, day);
          value = (0, _date.addDays)(prevDate, offset).getDate();
          if (offset > 0) {
            value = (0, _date.isLastDayOfMonth)(prevDate) ? 1 : value;
          } else {
            value = prevDate.getDate() === 1 ? (0, _date.lastDayOfMonth)(prevDate).getDate() : value;
          }
          break;
        }
      case 'H':
      case 'h':
        actionName = 'setHour';
        value = (0, _date.addHours)(new Date(year, month, day, hour), offset).getHours();
        break;
      case 'm':
        actionName = 'setMinute';
        value = (0, _date.addMinutes)(new Date(year, month, day, hour, minute), offset).getMinutes();
        break;
      case 's':
        actionName = 'setSecond';
        value = (0, _date.addSeconds)(new Date(year, month, day, hour, minute, second), offset).getSeconds();
        break;
      case 'a':
        actionName = 'setHour';
        value = hour >= 12 ? hour - 12 : hour + 12;
        break;
    }
    if (actionName && typeof value === 'number') {
      dispatch({
        type: actionName,
        value
      });
      const field = _DateField.patternMap[pattern];
      callback === null || callback === void 0 || callback(toDate(field, value));
    }
  };
  const setDateField = (pattern, value, callback) => {
    const field = _DateField.patternMap[pattern];
    const actionName = `set${(0, _startCase.default)(field)}`;
    dispatch({
      type: actionName,
      value
    });
    callback === null || callback === void 0 || callback(toDate(field, value));
  };
  const getDateField = pattern => {
    const fieldName = _DateField.patternMap[pattern];
    return {
      name: fieldName,
      value: dateField[fieldName]
    };
  };
  const toControlledDateString = () => {
    if (date && (0, _date.isValid)(date)) {
      return formatDate(date, formatStr, {
        locale
      });
    }
    // if date is not valid, return uncontrolled date string
    return toDateString();
  };
  const setNewDate = (0, _react.useCallback)(value => {
    dispatch({
      type: 'setNewDate',
      value
    });
  }, [dispatch]);
  (0, _react.useEffect)(() => {
    if (isControlledDate) {
      if (date && (0, _date.isValid)(date)) {
        setNewDate(date);
      } else if (date === null) {
        setNewDate(null);
      }
    }
  }, [date, dispatch, isControlledDate, setNewDate]);
  return {
    dateField,
    setDateOffset,
    setDateField,
    setNewDate,
    getDateField,
    toDateString: isControlledDate ? toControlledDateString : toDateString,
    isEmptyValue
  };
}
var _default = exports.default = useDateInputState;