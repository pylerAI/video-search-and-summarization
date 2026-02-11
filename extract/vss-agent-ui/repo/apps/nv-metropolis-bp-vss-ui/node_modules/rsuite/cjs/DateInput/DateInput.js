'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Input = _interopRequireDefault(require("../Input"));
var _useDateInputState = _interopRequireDefault(require("./hooks/useDateInputState"));
var _useKeyboardInputEvent = _interopRequireDefault(require("./hooks/useKeyboardInputEvent"));
var _useIsFocused = _interopRequireDefault(require("./hooks/useIsFocused"));
var _useFieldCursor = _interopRequireDefault(require("./hooks/useFieldCursor"));
var _useSelectedState = _interopRequireDefault(require("./hooks/useSelectedState"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _date = require("../internals/utils/date");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The DateInput component lets users select a date with the keyboard.
 * @version 5.58.0
 * @see https://rsuitejs.com/components/date-input/
 */
const DateInput = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults,
    parseDate,
    getLocale
  } = (0, _hooks.useCustom)('DateInput', props);
  const {
    dateLocale,
    shortDateFormat
  } = getLocale('DateTimeFormats');
  const {
    format: formatStr = shortDateFormat,
    value: valueProp,
    defaultValue,
    placeholder,
    onChange,
    onKeyDown,
    onBlur,
    onFocus,
    onPaste,
    ...rest
  } = propsWithDefaults;
  const inputRef = (0, _react.useRef)(null);
  const {
    selectedState,
    setSelectedState
  } = (0, _useSelectedState.default)();
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const {
    dateField,
    setDateOffset,
    setDateField,
    setNewDate,
    getDateField,
    toDateString,
    isEmptyValue
  } = (0, _useDateInputState.default)({
    formatStr,
    locale: dateLocale,
    date: value,
    isControlledDate: isControlled
  });
  const {
    isMoveCursor,
    isResetValue,
    increment,
    reset
  } = (0, _useFieldCursor.default)(formatStr, valueProp);
  const dateString = toDateString();
  const keyPressOptions = (0, _react.useMemo)(() => ({
    formatStr,
    localize: dateLocale.localize,
    selectedMonth: dateField.month,
    dateString
  }), [dateField, dateString, formatStr, dateLocale]);
  const setSelectionRange = (0, _utils2.useInputSelection)(inputRef);
  const handleChange = (0, _hooks.useEventCallback)((value, event) => {
    onChange === null || onChange === void 0 || onChange(value, event);
    setValue(value);
  });
  const handleClear = (0, _hooks.useEventCallback)(event => {
    handleChange(null, event);
    setNewDate(null);
    setSelectionRange(0, 0);
    reset();
  });
  const onSegmentChange = (0, _hooks.useEventCallback)((event, nextDirection) => {
    const input = event.target;
    const key = event.key;
    const direction = nextDirection || (key === 'ArrowRight' ? 'right' : 'left');
    const state = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
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
    setDateOffset(state.selectedPattern, offset, date => handleChange(date, event));
    setSelectionRange(state.selectionStart, state.selectionEnd);
  });
  const onSegmentValueChangeWithNumericKeys = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const key = event.key;
    const isFunctionKey = key.startsWith('F') && !isNaN(Number(key.slice(1)));
    if (isFunctionKey) {
      return;
    }
    const pattern = selectedState.selectedPattern;
    if (!pattern) {
      return;
    }
    const field = getDateField(pattern);
    const value = parseInt(key, 10);
    const padValue = parseInt(`${field.value || ''}${key}`, 10);
    let newValue = value;
    if ((0, _utils2.validateDateTime)(field.name, padValue) && !isResetValue()) {
      // Check if the value entered by the user is a valid date
      newValue = padValue;
    }
    setDateField(pattern, newValue, date => handleChange(date, event));

    // The currently selected month will be retained as a parameter of getInputSelectedState,
    // but if the user enters a month, the month value will be replaced with the value entered by the user.
    const selectedMonth = pattern === 'M' ? newValue : dateField.month;
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

    // If the text is all selected, clear the value
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
      setDateField(selectedState.selectedPattern, null, date => handleChange(date, event));
      reset();
    }
  });
  const onAmPmToggle = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const key = event.key.toLowerCase();

    // Only handle 'a' or 'p' keys when the selected pattern is 'a' (AM/PM)
    if (selectedState.selectedPattern === 'a' && (key === 'a' || key === 'p')) {
      const currentHour = dateField.hour || 0;
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
        setDateOffset('a', 1, date => handleChange(date, event));
        setSelectionRange(state.selectionStart, state.selectionEnd);
      }
    }
  });
  const handleClick = (0, _hooks.useEventCallback)(event => {
    const input = event.target;
    const state = (0, _utils2.getInputSelectedState)({
      ...keyPressOptions,
      input
    });
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
    const nextDate = parseDate(pasteText, formatStr);
    if ((0, _date.isValid)(nextDate)) {
      handleChange(nextDate, event);
      setNewDate(nextDate);
    }
    onPaste === null || onPaste === void 0 || onPaste(event);
  });
  const onKeyboardInput = (0, _useKeyboardInputEvent.default)({
    onSegmentChange,
    onSegmentValueChange,
    onSegmentValueChangeWithNumericKeys,
    onSegmentValueRemove,
    onAmPmToggle,
    onKeyDown
  });
  const [focused, focusEventProps] = (0, _useIsFocused.default)({
    onBlur,
    onFocus
  });
  const renderedValue = (0, _react.useMemo)(() => {
    if (!isEmptyValue()) {
      return dateString;
    }
    return !focused ? '' : dateString;
  }, [dateString, focused, isEmptyValue]);
  return /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({
    inputMode: focused ? 'numeric' : 'text',
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    ref: (0, _utils.mergeRefs)(inputRef, ref),
    onKeyDown: onKeyboardInput,
    onClick: handleClick,
    onPaste: handlePaste,
    value: renderedValue,
    placeholder: placeholder || formatStr
  }, focusEventProps, rest));
});
DateInput.displayName = 'DateInput';
var _default = exports.default = DateInput;