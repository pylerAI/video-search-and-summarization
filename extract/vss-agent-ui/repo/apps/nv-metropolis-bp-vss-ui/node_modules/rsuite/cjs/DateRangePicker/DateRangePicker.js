'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _Calendar = _interopRequireDefault(require("@rsuite/icons/Calendar"));
var _Time = _interopRequireDefault(require("@rsuite/icons/Time"));
var _Toolbar = _interopRequireDefault(require("../DatePicker/Toolbar"));
var _PredefinedRanges = _interopRequireDefault(require("../DatePicker/PredefinedRanges"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _DateRangeInput = _interopRequireDefault(require("../DateRangeInput"));
var _InputGroup = _interopRequireDefault(require("../InputGroup"));
var _Header = _interopRequireDefault(require("./Header"));
var _useDateDisabled = _interopRequireDefault(require("./hooks/useDateDisabled"));
var _useCustomizedInput = _interopRequireDefault(require("../DatePicker/hooks/useCustomizedInput"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _Calendar2 = _interopRequireDefault(require("./Calendar"));
var StaticMethods = _interopRequireWildcard(require("./disabledDateUtils"));
var _DateRangePickerProvider = require("./DateRangePickerProvider");
var _utils = require("./utils");
var _constants = require("../internals/constants");
var _hooks = require("../internals/hooks");
var _utils2 = require("../DatePicker/utils");
var _Picker = require("../internals/Picker");
var _utils3 = require("../internals/utils");
var _date = require("../internals/utils/date");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A date range picker allows you to select a date range from a calendar.
 *
 * @see https://rsuitejs.com/components/date-range-picker
 */
const DateRangePicker = (0, _utils3.forwardRef)((props, ref) => {
  var _ref, _ref2;
  const {
    formatDate,
    propsWithDefaults
  } = (0, _hooks.useCustom)('DateRangePicker', props);
  const {
    as,
    block,
    classPrefix = 'picker',
    className,
    appearance = 'default',
    editable = true,
    cleanable = true,
    character = ' ~ ',
    calendarSnapping,
    defaultCalendarValue,
    defaultValue,
    plaintext,
    disabled,
    shouldDisableDate,
    shouldDisableHour,
    shouldDisableMinute,
    shouldDisableSecond,
    format,
    hoverRange,
    id: idProp,
    isoWeek = false,
    weekStart,
    limitEndYear = 1000,
    limitStartYear,
    locale,
    loading,
    label,
    popupClassName,
    popupStyle,
    oneTap,
    placeholder = '',
    placement = 'bottomStart',
    ranges,
    readOnly,
    showOneCalendar = false,
    showWeekNumbers,
    showMeridiem,
    showHeader = true,
    style,
    size,
    caretAs: caretAsProp,
    value: valueProp,
    monthDropdownProps,
    hideHours,
    hideMinutes,
    hideSeconds,
    onChange,
    onClean,
    onEnter,
    onExit,
    onOk,
    onSelect,
    onShortcutClick,
    renderTitle,
    renderValue,
    renderCell,
    ...restProps
  } = propsWithDefaults;
  const id = (0, _hooks.useUniqueId)('rs-', idProp);
  const {
    trigger,
    root,
    target,
    overlay
  } = (0, _Picker.usePickerRef)(ref);
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const formatStr = format || (locale === null || locale === void 0 ? void 0 : locale.shortDateFormat) || 'yyyy-MM-dd';
  const rangeFormatStr = `${formatStr}${character}${formatStr}`;
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue !== null && defaultValue !== void 0 ? defaultValue : null);
  const {
    mode,
    has
  } = (0, _date.useDateMode)(formatStr);

  // Show only the calendar month panel. formatStr = 'yyyy-MM'
  const onlyShowMonth = mode === _date.DateMode.Month;

  // Only show the time panel. formatStr = 'HH:mm:ss'
  const onlyShowTime = mode === _date.DateMode.Time;

  // Allows two calendar panels to display the same month.
  const allowSameMonth = onlyShowMonth || showOneCalendar || onlyShowTime;

  // Default gap between two calendars, if `showOneCalendar` is set, the gap is 0
  const calendarGap = allowSameMonth ? 0 : 1;

  /**
   * Whether to complete the selection.
   * Everytime selection will change this value. If the value is false, it means that the selection has not been completed.
   *
   * In `oneTap` mode, select action will not change this value, its value should be true always.
   */
  const [isSelectedIdle, setSelectedIdle] = (0, _react.useState)(true);

  /**
   * The currently selected date range.
   *
   * The time range is selected by two clicks. After the first click,
   * the cursor will store a temporary event date in the process until
   * the second click to determine the end date of the date range.
   *
   */
  const [selectedDates, setSelectedDates] = (0, _react.useState)((_ref = valueProp !== null && valueProp !== void 0 ? valueProp : defaultValue) !== null && _ref !== void 0 ? _ref : []);

  // The date of the current hover, used to reduce the calculation of `handleMouseMove`
  const [hoverDateRange, setHoverDateRange] = (0, _react.useState)(value);

  // The displayed calendar panel is rendered based on this value.
  const [calendarDateRange, setCalendarDateRangeValue] = (0, _react.useState)((0, _utils.getSafeCalendarDate)({
    value: (_ref2 = value !== null && value !== void 0 ? value : defaultCalendarValue) !== null && _ref2 !== void 0 ? _ref2 : null,
    allowSameMonth
  }));

  /**
   * When hoverRange is set, `selectValue` will be updated during the hover process,
   * which will cause the `selectValue` to be updated after the first click,
   * so declare a Ref to temporarily store the `selectValue` of the first click.
   */
  const selectRangeValueRef = (0, _react.useRef)(null);

  /**
   *
   * The key of the currently active calendar panel.
   * Used to switch when only one calendar panel is displayed.
   */
  const [activeCalendarKey, setActiveCalendarKey] = (0, _react.useState)();

  /**
   * Get the time on the calendar.
   */
  const getCalendarDatetime = calendarKey => {
    const index = calendarKey === 'start' ? 0 : 1;
    return (calendarDateRange === null || calendarDateRange === void 0 ? void 0 : calendarDateRange[index]) || (defaultCalendarValue === null || defaultCalendarValue === void 0 ? void 0 : defaultCalendarValue[index]);
  };

  /**
   * Call this function to update the calendar panel rendering benchmark value.
   * If params `value` is not passed, it defaults to [new Date(), addMonth(new Date(), 1)].
   */
  const setCalendarDateRange = ({
    dateRange,
    calendarKey,
    eventName
  }) => {
    let nextValue = dateRange;

    // The time should remain the same when the dates in the date range are changed.
    if (has('time') && dateRange !== null && dateRange !== void 0 && dateRange.length && (eventName === 'changeDate' || eventName === 'changeMonth')) {
      const startDate = (0, _date.copyTime)({
        from: getCalendarDatetime('start'),
        to: dateRange[0]
      });
      const endDate = (0, _date.copyTime)({
        from: getCalendarDatetime('end'),
        to: dateRange.length === 1 ? (0, _date.addMonths)(startDate, calendarGap) : dateRange[1]
      });
      nextValue = [startDate, endDate];
    } else if (dateRange === null && typeof defaultCalendarValue !== 'undefined') {
      // Make the calendar render the value of defaultCalendarValue after clearing the value.
      nextValue = defaultCalendarValue;
    }
    const nextCalendarDate = (0, _utils.getSafeCalendarDate)({
      value: nextValue,
      calendarKey,
      allowSameMonth
    });
    setCalendarDateRangeValue(nextCalendarDate);
    if (onlyShowMonth && eventName === 'changeMonth') {
      setSelectedDates(nextCalendarDate);
    }
  };
  (0, _react.useEffect)(() => {
    // If value changes, update the selected and hover date values on the calendar panel.
    setSelectedDates(valueProp !== null && valueProp !== void 0 ? valueProp : []);
    setHoverDateRange(valueProp !== null && valueProp !== void 0 ? valueProp : null);
  }, [valueProp]);
  const getInputHtmlSize = () => {
    const padding = 4;
    let strings = rangeFormatStr;
    if (value) {
      const [startDate, endDate] = value;
      strings = `${formatDate(startDate, formatStr)}${character}${formatDate(endDate, formatStr)}`;
    }
    return (0, _utils3.getStringLength)(strings) + padding;
  };

  /**
   * preset hover range
   */
  const getHoverRangeValue = date => {
    function getHoverRangeFunc() {
      if (hoverRange === 'week') {
        return date => (0, _utils.getWeekHoverRange)(date, {
          isoWeek,
          weekStart,
          locale: locale === null || locale === void 0 ? void 0 : locale.dateLocale
        });
      } else if (hoverRange === 'month') {
        return _utils.getMonthHoverRange;
      }
      return hoverRange;
    }
    const hoverRangeFunc = getHoverRangeFunc();
    if ((0, _isNil.default)(hoverRangeFunc)) {
      return null;
    }
    let hoverValues = hoverRangeFunc(date);
    const isHoverRangeValid = hoverValues instanceof Array && hoverValues.length === 2;
    if (!isHoverRangeValid) {
      return null;
    }
    if ((0, _date.isAfter)(hoverValues[0], hoverValues[1])) {
      hoverValues = (0, _date.reverseDateRangeOmitTime)(hoverValues);
    }
    return hoverValues;
  };
  const setDateRange = (event, nextValue, closeOverlay = true) => {
    // If nextValue is null, it means that the user is erasing the selected dates.
    setSelectedDates(nextValue !== null && nextValue !== void 0 ? nextValue : []);
    setValue(nextValue);
    if (!(0, _utils.isSameRange)(nextValue, value, formatStr)) {
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }

    // `closeOverlay` default value is `true`
    if (closeOverlay !== false) {
      handleClose();
    }
  };

  /**
   * Select the date range. If oneTap is not set, you need to click twice to select the start time and end time.
   * The MouseMove event is called between the first click and the second click to update the selection state.
   */
  const onMouseMove = (0, _hooks.useEventCallback)(date => {
    const nextHoverDateRange = getHoverRangeValue(date);

    // If hasDoneSelect is false,
    // it means there's already one selected date
    // and waiting for user to select the second date to complete the selection.
    if (!isSelectedIdle) {
      // If `hoverRange` is set, you need to change the value of hoverDateRange according to the rules
      if (!(0, _isNil.default)(nextHoverDateRange) && !(0, _isNil.default)(selectRangeValueRef.current)) {
        let nextSelectedDates = [selectRangeValueRef.current[0], nextHoverDateRange[1]];
        if ((0, _date.isBefore)(nextHoverDateRange[0], selectRangeValueRef.current[0])) {
          nextSelectedDates = [nextHoverDateRange[0], selectRangeValueRef.current[1]];
        }
        setSelectedDates(nextSelectedDates);
      } else {
        setHoverDateRange(prevHoverValue => (0, _isNil.default)(prevHoverValue) ? null : [prevHoverValue[0], date]);
      }

      // Before the first click, if nextHoverDateRange has a value, hoverDateRange needs to be updated
    } else if (!(0, _isNil.default)(nextHoverDateRange)) {
      setHoverDateRange(nextHoverDateRange);
    }
  });

  /**
   * Callback for selecting a date cell in the calendar grid
   */
  const handleSelectDate = (0, _hooks.useEventCallback)((index, date, event) => {
    const calendarKey = index === 0 ? 'start' : 'end';
    let nextSelectDates = hoverDateRange !== null && hoverDateRange !== void 0 ? hoverDateRange : [];
    const hoverRangeValue = getHoverRangeValue(date);
    const noHoverRangeValid = (0, _isNil.default)(hoverRangeValue);

    // in `oneTap` mode
    if (oneTap) {
      setDateRange(event, noHoverRangeValid ? [(0, _date.startOfDay)(date), (0, _date.endOfDay)(date)] : hoverRangeValue);
      onSelect === null || onSelect === void 0 || onSelect(date, event);
      return;
    }

    // no preset hover range can use
    if (noHoverRangeValid) {
      // start select
      if (isSelectedIdle) {
        nextSelectDates = [date];
      } else {
        // finish select
        nextSelectDates[1] = date;
      }
    } else {
      if (!isSelectedIdle) {
        nextSelectDates = selectedDates;
        selectRangeValueRef.current = null;
      } else {
        nextSelectDates = hoverRangeValue;
        selectRangeValueRef.current = hoverRangeValue;
      }
    }
    if (nextSelectDates.length === 2) {
      // If user have completed the selection, then sort the selected dates.
      if ((0, _date.isAfter)(nextSelectDates[0], nextSelectDates[1])) {
        nextSelectDates = (0, _date.reverseDateRangeOmitTime)(nextSelectDates);
      }
      if (has('time')) {
        nextSelectDates = [(0, _date.copyTime)({
          from: getCalendarDatetime('start'),
          to: nextSelectDates[0]
        }), (0, _date.copyTime)({
          from: getCalendarDatetime('end'),
          to: nextSelectDates[1]
        })];
      }
      setHoverDateRange(nextSelectDates);
    } else {
      setHoverDateRange([nextSelectDates[0], nextSelectDates[0]]);
    }
    if (isSelectedIdle) {
      setActiveCalendarKey('end');
    } else {
      setActiveCalendarKey('start');
    }
    setSelectedDates(nextSelectDates);
    if (!(0, _date.isSameMonth)(calendarDateRange[index], date) || calendarSnapping) {
      setCalendarDateRange({
        dateRange: nextSelectDates,
        calendarKey,
        eventName: 'changeDate'
      });
    }
    onSelect === null || onSelect === void 0 || onSelect(date, event);
    setSelectedIdle(!isSelectedIdle);
  });

  /**
   * If `selectValue` changed, there will be the following effects.
   * 1. Check if the selection is completed.
   * 2. if the selection is completed, set the temporary `hoverValue` empty.
   */
  (0, _react.useEffect)(() => {
    const selectValueLength = selectedDates.length;
    const doneSelected = selectValueLength === 0 || selectValueLength === 2;
    doneSelected && setHoverDateRange(null);
  }, [selectedDates]);
  const onChangeCalendarMonth = (0, _hooks.useEventCallback)((index, date) => {
    const calendarKey = index === 0 ? 'start' : 'end';
    const nextCalendarDate = Array.from(calendarDateRange);
    nextCalendarDate[index] = date;

    // If allowSameMonth is true, the start and end dates should be the same
    if (allowSameMonth) {
      nextCalendarDate[0] = date;
      nextCalendarDate[1] = date;
    }
    setCalendarDateRange({
      dateRange: nextCalendarDate,
      calendarKey,
      eventName: 'changeMonth'
    });
  });
  const onChangeCalendarTime = (0, _hooks.useEventCallback)((index, date) => {
    const calendarKey = index === 0 ? 'start' : 'end';
    const nextCalendarDate = Array.from(calendarDateRange);
    nextCalendarDate[index] = date;
    setCalendarDateRange({
      dateRange: nextCalendarDate,
      calendarKey,
      eventName: 'changeTime'
    });
    setSelectedDates(prev => {
      const next = [...prev];

      // if next[index] is not empty, only update the time after aligning the year, month and day
      next[index] = next[index] ? (0, _date.copyTime)({
        from: date,
        to: next[index]
      }) : new Date(date.valueOf());
      return next;
    });
  });
  const handleEnter = (0, _hooks.useEventCallback)(() => {
    let nextCalendarDate;
    if (value && value.length) {
      const [startDate, endData] = value;
      nextCalendarDate = [startDate, (0, _date.isSameMonth)(startDate, endData) ? (0, _date.addMonths)(endData, calendarGap) : endData];
    } else {
      // Reset the date on the calendar to the default date
      nextCalendarDate = (0, _utils.getSafeCalendarDate)({
        value: defaultCalendarValue !== null && defaultCalendarValue !== void 0 ? defaultCalendarValue : null,
        allowSameMonth
      });
    }
    setSelectedDates(value !== null && value !== void 0 ? value : []);
    setCalendarDateRange({
      dateRange: nextCalendarDate
    });
  });
  const handleExit = (0, _hooks.useEventCallback)(() => {
    setSelectedIdle(true);
  });

  /**
   * Toolbar operation callback function
   */
  const handleShortcutPageDate = (0, _hooks.useEventCallback)((range, closeOverlay = false, event) => {
    const value = range.value;
    setCalendarDateRange({
      dateRange: value,
      eventName: 'shortcutSelection'
    });
    if (closeOverlay) {
      setDateRange(event, value, closeOverlay);
    } else {
      setSelectedDates(value !== null && value !== void 0 ? value : []);
    }
    onShortcutClick === null || onShortcutClick === void 0 || onShortcutClick(range, event);

    // End unfinished selections.
    setSelectedIdle(true);
  });
  const calculateDateRange = () => {
    const [start = calendarDateRange[0], end = calendarDateRange[1]] = selectedDates;
    if (onlyShowTime) {
      return [start, end];
    }
    return selectedDates;
  };
  const handleClickOK = (0, _hooks.useEventCallback)(event => {
    const nextValue = calculateDateRange();
    setDateRange(event, nextValue);
    onOk === null || onOk === void 0 || onOk(nextValue, event);
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    setCalendarDateRange({
      dateRange: null
    });
    setDateRange(event, null);
    onClean === null || onClean === void 0 || onClean(event);
    event.stopPropagation();
  });

  /**
   * Callback after the input box value is changed.
   */
  const handleInputChange = (0, _hooks.useEventCallback)((value, event) => {
    if (!value) {
      return;
    }
    const [startDate, endDate] = value;
    const selectValue = [startDate, endDate];
    setHoverDateRange(selectValue);
    setSelectedDates(selectValue);
    setCalendarDateRange({
      dateRange: selectValue
    });
    setDateRange(event, selectValue, false);
  });

  /**
   * Check if the date is disabled
   */
  const isDateDisabled = (0, _useDateDisabled.default)({
    shouldDisableDate
  });

  /**
   * Check if a date range is disabled
   */
  const isRangeDisabled = (start, end, target) => {
    if (isDateDisabled) {
      // If the date is between the start and the end the button is disabled
      while ((0, _date.isBefore)(start, end) || (0, _date.isSameDay)(start, end)) {
        if (isDateDisabled(start, {
          selectDate: selectedDates,
          selectedDone: isSelectedIdle,
          target
        })) {
          return true;
        }
        start = (0, _date.addDays)(start, 1);
      }
    }
    return false;
  };

  /**
   * Determine if the OK button should be disabled
   */
  const shouldDisableOkButton = () => {
    const [startDate, endDate] = calculateDateRange();

    // Check if start or end dates are missing
    if (!startDate || !endDate) {
      return true;
    }

    // Additional condition if only showing time
    if (!onlyShowTime && !isSelectedIdle) {
      return true;
    }

    // Check if there is any error in the selected date range
    if (isErrorValue([startDate, endDate])) {
      return true;
    }
    return false;
  };

  /**
   * Check if a shortcut is disabled based on the selected date range
   */
  const shouldDisableShortcut = (selectedDates = []) => {
    if (selectedDates === null) {
      return false;
    }
    const [startDate, endDate] = selectedDates;

    // Disable if either start or end date is missing
    if (!startDate || !endDate) {
      return true;
    }

    // Check if the date range is disabled for the shortcut
    return isRangeDisabled(startDate, endDate, _constants.DATERANGE_DISABLED_TARGET.TOOLBAR_SHORTCUT);
  };
  const handleClose = (0, _hooks.useEventCallback)(() => {
    var _trigger$current, _trigger$current$clos;
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || (_trigger$current$clos = _trigger$current.close) === null || _trigger$current$clos === void 0 || _trigger$current$clos.call(_trigger$current);
  });
  const handleInputKeyDown = (0, _hooks.useEventCallback)(event => {
    (0, _Picker.onMenuKeyDown)(event, {
      esc: handleClose,
      enter: () => {
        var _trigger$current2;
        const {
          open
        } = ((_trigger$current2 = trigger.current) === null || _trigger$current2 === void 0 ? void 0 : _trigger$current2.getState()) || {};
        if (!open) {
          var _trigger$current3;
          (_trigger$current3 = trigger.current) === null || _trigger$current3 === void 0 || _trigger$current3.open();
        }
      }
    });
  });
  const disableCalendarDate = isDateDisabled ? (date, values, type) => {
    return isDateDisabled(date, {
      selectDate: values,
      selectedDone: isSelectedIdle,
      target: type
    });
  } : undefined;
  const renderCalendarOverlay = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(className, popupClassName, prefix('popup-daterange'));
    const panelClasses = prefix('daterange-panel', {
      'daterange-panel-show-one-calendar': showOneCalendar,
      'daterange-panel-only-time': onlyShowTime
    });

    /**
     * Set a min-width (528px) when there are two calendars
     * @see https://github.com/rsuite/rsuite/issues/3522
     */
    const panelStyles = {
      minWidth: showOneCalendar || onlyShowTime ? 'auto' : 528
    };
    const calendarProps = {
      locale,
      isoWeek,
      weekStart,
      limitEndYear,
      showMeridiem,
      calendarDateRange,
      limitStartYear,
      showWeekNumbers,
      format: formatStr,
      value: selectedDates,
      monthDropdownProps,
      hoverRangeValue: hoverDateRange !== null && hoverDateRange !== void 0 ? hoverDateRange : undefined,
      hideHours,
      hideMinutes,
      hideSeconds,
      disabledHours: shouldDisableHour,
      disabledMinutes: shouldDisableMinute,
      disabledSeconds: shouldDisableSecond,
      disabledDate: disableCalendarDate,
      onSelect: handleSelectDate,
      onChangeCalendarMonth,
      onChangeCalendarTime,
      onMouseMove,
      renderTitle,
      renderCellOnPicker: renderCell
    };
    const getCalendars = () => {
      if (showOneCalendar) {
        return /*#__PURE__*/_react.default.createElement(_Calendar2.default, (0, _extends2.default)({
          index: activeCalendarKey === 'end' ? 1 : 0
        }, calendarProps));
      }
      return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Calendar2.default, (0, _extends2.default)({
        index: 0
      }, calendarProps)), /*#__PURE__*/_react.default.createElement(_Calendar2.default, (0, _extends2.default)({
        index: 1
      }, calendarProps)));
    };
    const {
      sideRanges,
      bottomRanges
    } = (0, _utils2.splitRanges)(ranges);
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      role: "dialog",
      "aria-labelledby": label ? `${id}-label` : undefined,
      tabIndex: -1,
      className: classes,
      ref: (0, _utils3.mergeRefs)(overlay, speakerRef),
      target: trigger,
      style: popupStyle
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: panelClasses,
      style: panelStyles
    }, /*#__PURE__*/_react.default.createElement(_Stack.default, {
      align: "flex-start",
      h: "100%"
    }, sideRanges && sideRanges.length > 0 && /*#__PURE__*/_react.default.createElement(_PredefinedRanges.default, {
      direction: "column",
      spacing: 0,
      className: prefix('daterange-predefined'),
      ranges: sideRanges,
      calendarDate: calendarDateRange,
      locale: locale,
      disableShortcut: shouldDisableShortcut,
      onShortcutClick: handleShortcutPageDate,
      "data-testid": "daterange-predefined-side"
    }), /*#__PURE__*/_react.default.createElement(_Box.default, {
      className: prefix('box')
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('daterange-content')
    }, showHeader && /*#__PURE__*/_react.default.createElement(_Header.default, {
      value: isSelectedIdle ? selectedDates : hoverDateRange,
      formatStr: formatStr,
      character: character,
      clickable: showOneCalendar,
      activeKey: activeCalendarKey,
      onSelect: setActiveCalendarKey
    }), /*#__PURE__*/_react.default.createElement("div", {
      className: prefix(`daterange-calendar-${showOneCalendar ? 'single' : 'group'}`)
    }, /*#__PURE__*/_react.default.createElement(_DateRangePickerProvider.DateRangePickerProvider, {
      value: {
        isSelectedIdle
      }
    }, getCalendars()))), /*#__PURE__*/_react.default.createElement(_Toolbar.default, {
      locale: locale,
      calendarDate: selectedDates,
      disableOkBtn: shouldDisableOkButton,
      disableShortcut: shouldDisableShortcut,
      hideOkBtn: oneTap,
      onOk: handleClickOK,
      onShortcutClick: handleShortcutPageDate,
      ranges: bottomRanges
    })))));
  };
  const hasValue = !(0, _isNil.default)(value) && value.length > 1;
  const caretAs = (0, _react.useMemo)(() => {
    if (caretAsProp === null) {
      return null;
    }
    return caretAsProp || (onlyShowTime ? _Time.default : _Calendar.default);
  }, [caretAsProp, onlyShowTime]);
  const isErrorValue = value => {
    if (!value) {
      return false;
    }

    // If the value is an empty array, it is not an error value.
    if (Array.isArray(value) && value.length === 0) {
      return false;
    }
    const [startDate, endDate] = value;
    if (!(0, _date.isValid)(startDate) || !(0, _date.isValid)(endDate)) {
      return true;
    }
    if ((0, _date.isBefore)(endDate, startDate)) {
      return true;
    }
    const disabledOptions = {
      selectDate: value,
      selectedDone: isSelectedIdle,
      target: _constants.DATERANGE_DISABLED_TARGET.INPUT
    };
    if (isDateDisabled !== null && isDateDisabled !== void 0 && isDateDisabled(startDate, disabledOptions) || isDateDisabled !== null && isDateDisabled !== void 0 && isDateDisabled(endDate, disabledOptions)) {
      return true;
    }
    return false;
  };
  const [ariaProps, rest] = (0, _utils3.partitionHTMLProps)(restProps, {
    htmlProps: [],
    includeAria: true
  });
  const showCleanButton = cleanable && hasValue && !readOnly;
  const invalidValue = value && isErrorValue(value);
  const {
    customValue,
    inputReadOnly,
    Input,
    events
  } = (0, _useCustomizedInput.default)({
    mode: 'dateRange',
    value,
    formatStr,
    renderValue,
    readOnly,
    editable,
    loading
  });
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    onEnter: (0, _utils3.createChainedFunction)(events.onActive, handleEnter, onEnter),
    onExit: (0, _utils3.createChainedFunction)(events.onInactive, handleExit, onExit)
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    pickerType: "date-range",
    classPrefix: classPrefix,
    className: merge(className, {
      [prefix('error')]: invalidValue
    }),
    block: block,
    disabled: disabled,
    appearance: appearance,
    style: style,
    rootRef: root,
    ref: trigger,
    placement: placement,
    trigger: "active",
    triggerProps: triggerProps,
    speaker: renderCalendarOverlay,
    "data-cleanable": cleanable
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_DateRangeInput.default, {
    value: value,
    format: formatStr,
    plaintext: plaintext
  }) : /*#__PURE__*/_react.default.createElement(_InputGroup.default, (0, _extends2.default)({}, (0, _omit.default)(rest, [..._date.calendarOnlyProps, ..._Picker.triggerPropKeys]), {
    inside: true,
    className: prefix`input-group`,
    disabled: disabled,
    size: size
  }), /*#__PURE__*/_react.default.createElement(_Picker.PickerLabel, {
    className: prefix`label`,
    id: `${id}-label`
  }, label), /*#__PURE__*/_react.default.createElement(Input, (0, _extends2.default)({
    "aria-haspopup": "dialog",
    "aria-invalid": invalidValue,
    "aria-labelledby": label ? `${id}-label` : undefined
  }, ariaProps, {
    ref: target,
    id: id,
    value: customValue || value,
    character: character,
    format: formatStr,
    placeholder: placeholder ? placeholder : rangeFormatStr,
    disabled: disabled,
    readOnly: inputReadOnly,
    htmlSize: getInputHtmlSize(),
    onChange: handleInputChange,
    onKeyDown: handleInputKeyDown
  })), /*#__PURE__*/_react.default.createElement(_Picker.PickerIndicator, {
    size: size,
    loading: loading,
    caretAs: caretAs,
    onClose: handleClean,
    showCleanButton: showCleanButton
  })));
}, StaticMethods);
DateRangePicker.displayName = 'DateRangePicker';
var _default = exports.default = DateRangePicker;