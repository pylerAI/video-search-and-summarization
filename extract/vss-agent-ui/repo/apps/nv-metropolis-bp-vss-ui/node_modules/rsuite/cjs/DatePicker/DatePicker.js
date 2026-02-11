'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _mapValues = _interopRequireDefault(require("lodash/mapValues"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _CalenderSimple = _interopRequireDefault(require("@rsuite/icons/CalenderSimple"));
var _Time = _interopRequireDefault(require("@rsuite/icons/Time"));
var _CalendarContainer = _interopRequireDefault(require("../Calendar/CalendarContainer"));
var _Toolbar = _interopRequireDefault(require("./Toolbar"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _PredefinedRanges = _interopRequireDefault(require("./PredefinedRanges"));
var _DateInput = _interopRequireDefault(require("../DateInput"));
var _InputGroup = _interopRequireDefault(require("../InputGroup"));
var _useMonthView = _interopRequireDefault(require("./hooks/useMonthView"));
var _useFocus = _interopRequireDefault(require("./hooks/useFocus"));
var _useCustomizedInput = _interopRequireDefault(require("./hooks/useCustomizedInput"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../Calendar/hooks");
var _utils = require("../Calendar/utils");
var _utils2 = require("../internals/utils");
var _hooks2 = require("../internals/hooks");
var _date = require("../internals/utils/date");
var _Picker = require("../internals/Picker");
var _OverlayTrigger = require("../internals/Overlay/OverlayTrigger");
var _utils3 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A date picker allows users to select a date from a calendar.
 *
 * @see https://rsuitejs.com/components/date-picker
 */
const DatePicker = (0, _utils2.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks2.useCustom)('DatePicker', props);
  const {
    as,
    block,
    className,
    classPrefix = 'picker',
    calendarDefaultDate,
    cleanable = true,
    caretAs: caretAsProp,
    editable = true,
    defaultValue,
    disabled,
    readOnly: readOnly,
    plaintext,
    format,
    id: idProp,
    isoWeek,
    weekStart,
    limitEndYear = 1000,
    limitStartYear,
    locale,
    loading,
    label,
    popupClassName,
    popupStyle,
    appearance = 'default',
    placement = 'bottomStart',
    oneTap,
    placeholder = '',
    ranges,
    value: valueProp,
    showMeridiem,
    showWeekNumbers,
    style,
    size,
    monthDropdownProps,
    shouldDisableDate,
    shouldDisableHour,
    shouldDisableMinute,
    shouldDisableSecond,
    onChange,
    onChangeCalendarDate,
    onClean,
    onEnter,
    onExit,
    onNextMonth,
    onOk,
    onPrevMonth,
    onSelect,
    onToggleMonthDropdown,
    onToggleTimeDropdown,
    onShortcutClick,
    renderCell,
    renderValue,
    ...restProps
  } = propsWithDefaults;
  const id = (0, _hooks2.useUniqueId)('rs-', idProp);
  const {
    trigger,
    root,
    target,
    overlay
  } = (0, _Picker.usePickerRef)(ref);
  const formatStr = format || (locale === null || locale === void 0 ? void 0 : locale.shortDateFormat) || 'yyyy-MM-dd';
  const {
    merge,
    prefix
  } = (0, _hooks2.useStyles)(classPrefix);
  const [value, setValue] = (0, _hooks2.useControlled)(valueProp, defaultValue);
  const {
    calendarDate,
    setCalendarDate,
    resetCalendarDate
  } = (0, _hooks.useCalendarDate)(value, calendarDefaultDate);
  const {
    setMonthView,
    monthView,
    toggleMonthView
  } = (0, _useMonthView.default)({
    onToggleMonthDropdown
  });
  const {
    mode
  } = (0, _date.useDateMode)(formatStr);

  // Show only the calendar month panel. formatStr = 'yyyy-MM'
  const showMonth = mode === _date.DateMode.Month || monthView;
  const {
    focusInput,
    focusSelectedDate,
    onKeyFocusEvent
  } = (0, _useFocus.default)({
    target,
    showMonth,
    id,
    locale
  });

  /**
   * Check whether the date is disabled.
   */
  const isDateDisabled = date => {
    if (typeof shouldDisableDate === 'function') {
      return shouldDisableDate(date);
    }
    return false;
  };

  /**
   * Check whether the time is within the time range of the shortcut option in the toolbar.
   */
  const isDatetimeDisabled = date => {
    return (isDateDisabled === null || isDateDisabled === void 0 ? void 0 : isDateDisabled(date)) || (0, _date.disableTime)(props, date);
  };

  /**
   * Check whether the month is disabled.
   * If any day in the month is disabled, the entire month is disabled
   */
  const isMonthDisabled = date => {
    return (0, _utils.isEveryDateInMonth)(date.getFullYear(), date.getMonth(), isDateDisabled);
  };

  /**
   * Whether "OK" button is disabled
   *
   * - If format is date, disable ok button if selected date is disabled
   * - If format is month, disable ok button if all dates in the month of selected date are disabled
   */
  const isOkButtonDisabled = selectedDate => {
    if (mode === _date.DateMode.Month) {
      return isMonthDisabled(selectedDate);
    }
    return isDatetimeDisabled(selectedDate);
  };
  const isErrorValue = value => {
    if (!(0, _date.isValid)(value)) {
      return true;
    } else if (value && isDateDisabled(value)) {
      return true;
    }
    return false;
  };

  /**
   * Switch to the callback triggered after the next month.
   */
  const handleMoveForward = (0, _hooks2.useEventCallback)(nextPageDate => {
    setCalendarDate(nextPageDate);
    onNextMonth === null || onNextMonth === void 0 || onNextMonth(nextPageDate);
    onChangeCalendarDate === null || onChangeCalendarDate === void 0 || onChangeCalendarDate(nextPageDate);
  });

  /**
   * Switch to the callback triggered after the previous month.
   */
  const handleMoveBackward = (0, _hooks2.useEventCallback)(nextPageDate => {
    setCalendarDate(nextPageDate);
    onPrevMonth === null || onPrevMonth === void 0 || onPrevMonth(nextPageDate);
    onChangeCalendarDate === null || onChangeCalendarDate === void 0 || onChangeCalendarDate(nextPageDate);
  });

  /**
   * The callback triggered when the date changes.
   */
  const handleDateChange = (0, _hooks2.useEventCallback)((nextValue, event) => {
    onSelect === null || onSelect === void 0 || onSelect(nextValue, event);
    onChangeCalendarDate === null || onChangeCalendarDate === void 0 || onChangeCalendarDate(nextValue, event);
  });

  /**
   *  A callback triggered when the time on the calendar changes.
   */
  const handleChangeTime = (0, _hooks2.useEventCallback)(nextPageTime => {
    setCalendarDate(nextPageTime);
    handleDateChange(nextPageTime);
  });

  /**
   * Close the calendar panel.
   */
  const handleClose = (0, _hooks2.useEventCallback)(() => {
    var _trigger$current, _trigger$current$clos;
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || (_trigger$current$clos = _trigger$current.close) === null || _trigger$current$clos === void 0 || _trigger$current$clos.call(_trigger$current);
  });
  const updateValue = (event, date, closeOverlay = true) => {
    const nextValue = typeof date !== 'undefined' ? date : calendarDate;
    setCalendarDate(nextValue || (0, _date.startOfToday)());
    setValue(nextValue);
    if (nextValue !== value) {
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }

    // `closeOverlay` default value is `true`
    if (closeOverlay !== false) {
      handleClose();
    }
  };

  /**
   * The callback triggered after the date in the shortcut area is clicked.
   */
  const handleShortcutPageDate = (0, _hooks2.useEventCallback)((range, closeOverlay, event) => {
    const value = range.value;
    updateValue(event, value, closeOverlay);
    handleDateChange(value, event);
    onShortcutClick === null || onShortcutClick === void 0 || onShortcutClick(range, event);
  });

  /**
   * The callback triggered after clicking the OK button.
   */
  const handleOK = (0, _hooks2.useEventCallback)(event => {
    updateValue(event);
    onOk === null || onOk === void 0 || onOk(calendarDate, event);
    focusInput();
  });

  /**
   * Callback after clicking the clear button.
   */

  const handleClean = (0, _hooks2.useEventCallback)(event => {
    event === null || event === void 0 || event.stopPropagation();
    updateValue(event, null);
    resetCalendarDate(null);
    onClean === null || onClean === void 0 || onClean(event);
  });
  const handlePickerPopupKeyDown = (0, _hooks2.useEventCallback)(event => {
    onKeyFocusEvent(event, {
      date: calendarDate,
      callback: setCalendarDate
    });
    if (event.key === 'Enter') {
      handleOK(event);
    }
  });
  const handleClick = (0, _hooks2.useEventCallback)(() => {
    if (editable) {
      return;
    }
    focusSelectedDate();
  });

  /**
   * Callback after the date is selected.
   */
  const handleCalendarSelect = (0, _hooks2.useEventCallback)((date, event, updatableValue = true) => {
    const nextValue = (0, _date.copyTime)({
      from: calendarDate,
      to: date
    });
    setCalendarDate(nextValue);
    handleDateChange(nextValue);
    if (oneTap && updatableValue) {
      updateValue(event, nextValue);
      focusInput();
    }
  });

  /**
   *  A callback triggered when the date on the calendar changes.
   */
  const handleChangeMonth = (0, _hooks2.useEventCallback)((nextPageDate, event) => {
    setCalendarDate(nextPageDate);
    handleDateChange(nextPageDate);
    focusSelectedDate();
    if (oneTap && mode === _date.DateMode.Month) {
      updateValue(event, nextPageDate);
      focusInput();
    }
  });

  /**
   * Callback after the input box value is changed.
   */
  const handleInputChange = (0, _hooks2.useEventCallback)((value, event) => {
    if (!isErrorValue(value)) {
      handleCalendarSelect(value, event);
    }
    updateValue(event, value, false);
  });
  const handleInputKeyDown = (0, _hooks2.useEventCallback)(event => {
    (0, _Picker.onMenuKeyDown)(event, {
      esc: handleClose,
      enter: () => {
        var _trigger$current2;
        const {
          open
        } = ((_trigger$current2 = trigger.current) === null || _trigger$current2 === void 0 ? void 0 : _trigger$current2.getState()) || {};
        if (open) {
          if ((0, _date.isValid)(calendarDate) && !isDateDisabled(calendarDate)) {
            updateValue(event);
            focusInput();
          }
        } else {
          var _trigger$current3;
          (_trigger$current3 = trigger.current) === null || _trigger$current3 === void 0 || _trigger$current3.open();
        }
      }
    });
  });
  const calendarProps = (0, _mapValues.default)((0, _pick.default)(props, _date.calendarOnlyProps), func => (next, date) => {
    var _func;
    return (_func = func === null || func === void 0 ? void 0 : func(next, date)) !== null && _func !== void 0 ? _func : false;
  });
  const {
    sideRanges,
    bottomRanges
  } = (0, _utils3.splitRanges)(ranges);
  const renderCalendarOverlay = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(popupClassName, className, prefix('popup-date'));
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      role: "dialog",
      "aria-labelledby": label ? `${id}-label` : undefined,
      tabIndex: -1,
      className: classes,
      ref: (0, _utils2.mergeRefs)(overlay, speakerRef),
      style: popupStyle,
      target: trigger,
      onKeyDown: handlePickerPopupKeyDown
    }, /*#__PURE__*/_react.default.createElement(_Stack.default, {
      align: "flex-start",
      h: "100%"
    }, sideRanges && sideRanges.length > 0 && /*#__PURE__*/_react.default.createElement(_PredefinedRanges.default, {
      direction: "column",
      spacing: 0,
      className: prefix('date-predefined'),
      ranges: sideRanges,
      calendarDate: calendarDate,
      locale: locale,
      disableShortcut: isDatetimeDisabled,
      onShortcutClick: handleShortcutPageDate
    }), /*#__PURE__*/_react.default.createElement(_Box.default, {
      className: prefix('box')
    }, /*#__PURE__*/_react.default.createElement(_CalendarContainer.default, (0, _extends2.default)({}, calendarProps, {
      targetId: id,
      locale: locale,
      showWeekNumbers: showWeekNumbers,
      showMeridiem: showMeridiem,
      disabledDate: isDateDisabled,
      disabledHours: shouldDisableHour,
      disabledMinutes: shouldDisableMinute,
      disabledSeconds: shouldDisableSecond,
      limitEndYear: limitEndYear,
      limitStartYear: limitStartYear,
      format: formatStr,
      isoWeek: isoWeek,
      weekStart: weekStart,
      calendarDate: calendarDate,
      monthDropdownProps: monthDropdownProps,
      renderCellOnPicker: renderCell,
      onMoveForward: handleMoveForward,
      onMoveBackward: handleMoveBackward,
      onSelect: handleCalendarSelect,
      onToggleMonthDropdown: toggleMonthView,
      onToggleTimeDropdown: onToggleTimeDropdown,
      onChangeMonth: handleChangeMonth,
      onChangeTime: handleChangeTime
    })), /*#__PURE__*/_react.default.createElement(_Toolbar.default, {
      locale: locale,
      ranges: bottomRanges,
      calendarDate: calendarDate,
      disableOkBtn: isOkButtonDisabled,
      disableShortcut: isDatetimeDisabled,
      onShortcutClick: handleShortcutPageDate,
      onOk: handleOK,
      hideOkBtn: oneTap
    }))));
  };
  const hasValue = (0, _date.isValid)(value);
  const caretAs = (0, _react.useMemo)(() => {
    if (caretAsProp === null) {
      return null;
    }
    return caretAsProp || (mode === _date.DateMode.Time ? _Time.default : _CalenderSimple.default);
  }, [caretAsProp, mode]);
  const handleTriggerClose = (0, _hooks2.useEventCallback)(cause => {
    var _props$onClose;
    // Unless overlay is closing on user clicking "OK" button,
    // reset the selected date on calendar panel
    if (cause !== _OverlayTrigger.OverlayCloseCause.ImperativeHandle) {
      resetCalendarDate();
    }
    setMonthView(false);
    (_props$onClose = props.onClose) === null || _props$onClose === void 0 || _props$onClose.call(props);
  });
  const showCleanButton = cleanable && hasValue && !readOnly;
  const [ariaProps, rest] = (0, _utils2.partitionHTMLProps)(restProps, {
    htmlProps: [],
    includeAria: true
  });
  const invalidValue = value && isErrorValue(value);
  const customizedProps = {
    value,
    formatStr,
    renderValue,
    readOnly,
    editable,
    loading
  };
  const {
    customValue,
    inputReadOnly,
    Input,
    events
  } = (0, _useCustomizedInput.default)(customizedProps);
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    onClose: handleTriggerClose,
    onEnter: (0, _utils2.createChainedFunction)(events.onActive, onEnter),
    onExit: (0, _utils2.createChainedFunction)(events.onInactive, onExit)
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    pickerType: "date",
    classPrefix: classPrefix,
    className: merge(className, {
      [prefix('error')]: invalidValue
    }),
    block: block,
    disabled: disabled,
    appearance: appearance,
    style: style,
    rootRef: root,
    trigger: "active",
    triggerProps: triggerProps,
    ref: trigger,
    placement: placement,
    speaker: renderCalendarOverlay,
    "data-cleanable": cleanable
  }, plaintext ? /*#__PURE__*/_react.default.createElement(_DateInput.default, {
    value: value,
    format: formatStr,
    plaintext: plaintext
  }) : /*#__PURE__*/_react.default.createElement(_InputGroup.default, (0, _extends2.default)({}, (0, _utils3.getRestProps)(rest), {
    inside: true,
    size: size,
    disabled: disabled,
    className: prefix`input-group`,
    onClick: handleClick
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
    format: formatStr,
    placeholder: placeholder ? placeholder : formatStr,
    disabled: disabled,
    readOnly: inputReadOnly,
    onChange: handleInputChange,
    onKeyDown: handleInputKeyDown
  })), /*#__PURE__*/_react.default.createElement(_Picker.PickerIndicator, {
    size: size,
    loading: loading,
    caretAs: caretAs,
    onClose: handleClean,
    showCleanButton: showCleanButton
  })));
});
DatePicker.displayName = 'DatePicker';
var _default = exports.default = DatePicker;