'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Input = _interopRequireDefault(require("../Input"));
var _date = require("../internals/utils/date");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _DateInput = require("../DateInput");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The DateRangeInput component lets users select a date with the keyboard.
 * @version 5.59.0
 * @see https://rsuitejs.com/components/date-range-input/
 */
const DateRangeInput = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    propsWithDefaults,
    parseDate,
    getLocale
  } = (0, _hooks.useCustom)('Calendar', props);
  const {
    shortDateFormat,
    dateLocale
  } = getLocale('DateTimeFormats');
  const {
    className,
    classPrefix = 'date-range-input',
    character = ' ~ ',
    format: formatStr = shortDateFormat,
    value: valueProp,
    defaultValue = [],
    placeholder,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
    onPaste,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const inputRef = (0, _react.useRef)(null);
  const {
    selectedState,
    setSelectedState
  } = (0, _DateInput.useSelectedState)();
  const rangeFormatStr = `${formatStr}${character}${formatStr}`;
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const [dateType, setDateType] = (0, _react.useState)(_utils2.DateType.Start);
  const dateInputOptions = {
    formatStr,
    locale: dateLocale,
    isControlledDate: isControlled
  };
  const startDateState = (0, _DateInput.useDateInputState)({
    ...dateInputOptions,
    date: (value === null || value === void 0 ? void 0 : value[0]) || null
  });
  const endDateState = (0, _DateInput.useDateInputState)({
    ...dateInputOptions,
    date: (value === null || value === void 0 ? void 0 : value[1]) || null
  });
  const {
    isMoveCursor,
    isResetValue,
    increment,
    reset
  } = (0, _DateInput.useFieldCursor)(formatStr, valueProp);
  const getActiveState = (type = dateType) => {
    return type === _utils2.DateType.Start ? startDateState : endDateState;
  };
  const [focused, focusEventProps] = (0, _DateInput.useIsFocused)({
    onBlur,
    onFocus
  });
  const renderedValue = (0, _react.useMemo)(() => {
    const dateString = startDateState.toDateString() + character + endDateState.toDateString();
    if (!startDateState.isEmptyValue() || !endDateState.isEmptyValue()) {
      return dateString;
    }
    return !focused ? '' : dateString;
  }, [character, endDateState, focused, startDateState]);
  const keyPressOptions = {
    formatStr,
    rangeFormatStr,
    localize: dateLocale.localize,
    selectedMonth: getActiveState().dateField.month,
    dateString: renderedValue,
    dateType,
    character
  };
  const setSelectionRange = (0, _DateInput.useInputSelection)(inputRef);
  const handleChange = (0, _hooks.useEventCallback)((date, event) => {
    const nextValue = dateType === _utils2.DateType.Start ? [date, value === null || value === void 0 ? void 0 : value[1]] : [value === null || value === void 0 ? void 0 : value[0], date];
    onChange === null || onChange === void 0 || onChange(nextValue, event);
    setValue(nextValue);
  });
  const handleClear = (0, _hooks.useEventCallback)(event => {
    startDateState.setNewDate(null);
    endDateState.setNewDate(null);
    setSelectionRange(0, 0);
    reset();
    setValue(null);
    onChange === null || onChange === void 0 || onChange(null, event);
  });
  const onSegmentChange = (0, _hooks.useEventCallback)((event, nextDirection) => {
    const input = event.target;
    const key = event.key;
    const direction = nextDirection || (key === 'ArrowRight' ? 'right' : 'left');
    if (input.selectionEnd === null || input.selectionStart === null) {
      return;
    }
    const cursorIndex = direction === 'right' ? input.selectionEnd : input.selectionStart;
    let nextDateType = dateType;
    if ((0, _utils2.isSwitchDateType)(renderedValue, character, cursorIndex, direction)) {
      nextDateType = dateType === _utils2.DateType.Start ? _utils2.DateType.End : _utils2.DateType.Start;
      setDateType(nextDateType);
    }
    const state = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
      dateType: nextDateType,
      selectedMonth: getActiveState(nextDateType).dateField.month,
      input,
      direction
    });
    setSelectedState(state);
    setSelectionRange(state.selectionStart, state.selectionEnd);

    // If the selected field changes, reset the input state
    if (selectedState.selectedPattern !== state.selectedPattern) {
      reset();
    }
  });
  const onSegmentValueChange = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const key = event.key;
    const offset = key === 'ArrowUp' ? 1 : -1;
    const state = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
      input,
      valueOffset: offset
    });
    setSelectedState(state);
    getActiveState().setDateOffset(state.selectedPattern, offset, date => handleChange(date, event));
    setSelectionRange(state.selectionStart, state.selectionEnd);
  });
  const onSegmentValueChangeWithNumericKeys = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const key = event.key;
    const pattern = selectedState.selectedPattern;
    const isFunctionKey = key.startsWith('F') && !isNaN(Number(key.slice(1)));
    if (isFunctionKey) {
      return;
    }
    if (!pattern) {
      return;
    }
    const field = getActiveState().getDateField(pattern);
    const value = parseInt(key, 10);
    const padValue = parseInt(`${field.value || ''}${key}`, 10);
    let newValue = value;

    // Check if the value entered by the user is a valid date
    if ((0, _DateInput.validateDateTime)(field.name, padValue) && !isResetValue()) {
      newValue = padValue;
    }
    getActiveState().setDateField(pattern, newValue, date => handleChange(date, event));

    // The currently selected month will be retained as a parameter of getInputSelectedState,
    // but if the user enters a month, the month value will be replaced with the value entered by the user.
    const selectedMonth = pattern === 'M' ? newValue : getActiveState().dateField.month;
    const nextState = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
      input,
      selectedMonth
    });
    setSelectedState(nextState);
    setSelectionRange(nextState.selectionStart, nextState.selectionEnd);
    increment();

    // If the field is full value, move the cursor to the next field
    if (isMoveCursor(newValue, pattern) && input.selectionEnd !== input.value.length) {
      onSegmentChange(event, 'right');
    }
  });
  const onSegmentValueRemove = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const value = input.value;
    if (input.selectionStart === 0 && value && input.selectionEnd === value.length) {
      handleClear(event);
    } else if (selectedState.selectedPattern) {
      const nextState = (0, _utils2.getInputSelectedState)({
        ...keyPressOptions,
        input,
        valueOffset: null
      });
      setSelectedState(nextState);
      setSelectionRange(nextState.selectionStart, nextState.selectionEnd);
      getActiveState().setDateField(selectedState.selectedPattern, null, date => handleChange(date, event));
      reset();
    }
  });
  const onAmPmToggle = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const key = event.key.toLowerCase();

    // Only handle 'a' or 'p' keys when the selected pattern is 'a' (AM/PM)
    if (selectedState.selectedPattern === 'a' && (key === 'a' || key === 'p')) {
      const currentHour = getActiveState().dateField.hour || 0;
      const isAM = currentHour < 12;
      const isPM = currentHour >= 12;

      // Toggle AM/PM based on the key pressed
      // 'a' key -> set to AM, 'p' key -> set to PM
      if (key === 'a' && isPM || key === 'p' && isAM) {
        const state = (0, _utils2.getInputSelectedState)({
          ...keyPressOptions,
          input
        });
        setSelectedState(state);
        getActiveState().setDateOffset('a', 1, date => handleChange(date, event));
        setSelectionRange(state.selectionStart, state.selectionEnd);
      }
    }
  });
  const handleClick = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    if (input.selectionStart === null) {
      return;
    }
    const cursorIndex = input.selectionStart === renderedValue.length ? 0 : input.selectionStart;
    const dateType = (0, _utils2.getDateType)(renderedValue || rangeFormatStr, character, cursorIndex);
    const state = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
      dateType,
      selectedMonth: getActiveState(dateType).dateField.month,
      input
    });
    setDateType(dateType);
    setSelectedState(state);
    setSelectionRange(state.selectionStart, state.selectionEnd);
    if (selectedState.selectedPattern !== state.selectedPattern) {
      reset();
    }
  });
  const handlePaste = (0, _hooks.useEventCallback)(event => {
    var _event$clipboardData;
    event.preventDefault();
    const pasteText = (_event$clipboardData = event.clipboardData) === null || _event$clipboardData === void 0 ? void 0 : _event$clipboardData.getData('text');
    const [start, end] = pasteText.split(character).map(date => parseDate(date, formatStr));
    if ((0, _date.isValid)(start) && (0, _date.isValid)(end)) {
      const nextValue = [start, end];
      onChange === null || onChange === void 0 || onChange(nextValue, event);
      setValue(nextValue);
      startDateState.setNewDate(start);
      endDateState.setNewDate(end);
    }
    onPaste === null || onPaste === void 0 || onPaste(event);
  });
  const onKeyboardInput = (0, _DateInput.useKeyboardInputEvent)({
    onSegmentChange,
    onSegmentValueChange,
    onSegmentValueChangeWithNumericKeys,
    onSegmentValueRemove,
    onAmPmToggle,
    onKeyDown
  });
  return /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({
    inputMode: focused ? 'numeric' : 'text',
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    className: classes,
    ref: (0, _utils.mergeRefs)(inputRef, ref),
    onKeyDown: onKeyboardInput,
    onClick: handleClick,
    onPaste: handlePaste,
    value: renderedValue,
    placeholder: placeholder || rangeFormatStr
  }, focusEventProps, rest));
});
DateRangeInput.displayName = 'DateRangeInput';
var _default = exports.default = DateRangeInput;