'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _delay = _interopRequireDefault(require("lodash/delay"));
var _addMonths = require("date-fns/addMonths");
var _addDays = require("date-fns/addDays");
var _hooks = require("../../internals/hooks");
var _utils = require("../../Calendar/utils");
var _utils2 = require("../../internals/Picker/utils");
function useFocus(props) {
  const {
    target,
    showMonth,
    id,
    locale: localeProp
  } = props;
  const {
    getLocale,
    formatDate
  } = (0, _hooks.useCustom)();
  const {
    formattedMonthPattern,
    formattedDayPattern
  } = getLocale('DateTimeFormats', localeProp);

  /**
   * Get the corresponding container based on date selection and month selection
   */
  const getOverlayContainer = () => {
    return showMonth ? document.getElementById(`${id}-calendar-month-dropdown`) : document.getElementById(`${id}-calendar-table`);
  };

  /**
   * Check whether the date is focusable
   */
  const checkFocusable = date => {
    const formatStr = showMonth ? formattedMonthPattern : formattedDayPattern;
    const ariaLabel = (0, _utils.getAriaLabel)(date, formatStr, formatDate);
    const container = getOverlayContainer();
    const dateElement = container === null || container === void 0 ? void 0 : container.querySelector(`[aria-label="${ariaLabel}"]`);
    if ((dateElement === null || dateElement === void 0 ? void 0 : dateElement.getAttribute('aria-disabled')) === 'true') {
      return false;
    }
    return true;
  };

  /**
   * Focus on the currently selected date element
   */
  const focusSelectedDate = () => {
    (0, _delay.default)(() => {
      const container = getOverlayContainer();
      const selectedElement = container === null || container === void 0 ? void 0 : container.querySelector('[aria-selected="true"]');
      selectedElement === null || selectedElement === void 0 || selectedElement.focus();
    }, 1);
  };

  /**
   * Focus on the input element
   */
  const focusInput = (0, _hooks.useEventCallback)(() => {
    (0, _delay.default)(() => {
      var _target$current;
      return (_target$current = target.current) === null || _target$current === void 0 ? void 0 : _target$current.focus();
    }, 1);
  });
  const onKeyFocusEvent = (0, _hooks.useEventCallback)((event, options) => {
    const {
      date,
      callback
    } = options;
    let delta = 0;
    const step = showMonth ? 6 : 7;
    const changeDateFunc = showMonth ? _addMonths.addMonths : _addDays.addDays;
    (0, _utils2.onMenuKeyDown)(event, {
      down: () => {
        delta = step;
      },
      up: () => {
        delta = -step;
      },
      right: () => {
        delta = 1;
      },
      left: () => {
        delta = -1;
      }
    });
    const nextDate = changeDateFunc(date, delta);
    if (checkFocusable(nextDate)) {
      callback(nextDate);
      focusSelectedDate();
    }
  });
  return {
    focusInput,
    focusSelectedDate,
    onKeyFocusEvent
  };
}
var _default = exports.default = useFocus;