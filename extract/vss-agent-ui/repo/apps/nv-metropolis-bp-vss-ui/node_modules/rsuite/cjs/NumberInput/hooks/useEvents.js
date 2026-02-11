'use client';
"use strict";

exports.__esModule = true;
exports.useEvents = useEvents;
var _react = require("react");
var _hooks = require("../../internals/hooks");
var _constants = require("../../internals/constants");
var _number = require("../utils/number");
var _useWheelHandler = require("./useWheelHandler");
function useEvents(params) {
  const inputRef = (0, _react.useRef)(null);
  const [isFocused, setIsFocused] = (0, _react.useState)(false);
  const {
    value,
    onChangeValue,
    scrollable,
    disabled,
    readOnly,
    onWheel: onWheelProp,
    min,
    max,
    step = 1,
    decimalSeparator
  } = params;
  const getSafeValue = value => (0, _number.clampValue)(value, min, max);
  const onStepUp = (0, _hooks.useEventCallback)(event => {
    const val = +(value || 0);
    const bit = (0, _number.decimals)(val, step);
    onChangeValue(getSafeValue((val + step).toFixed(bit)), event);
  });
  const onStepDown = (0, _hooks.useEventCallback)(event => {
    const val = +(value || 0);
    const bit = (0, _number.decimals)(val, step);
    onChangeValue(getSafeValue((val - step).toFixed(bit)), event);
  });
  const onKeyDown = (0, _hooks.useEventCallback)(event => {
    switch (event.key) {
      case _constants.KEY_VALUES.UP:
        event.preventDefault();
        onStepUp(event);
        break;
      case _constants.KEY_VALUES.DOWN:
        event.preventDefault();
        onStepDown(event);
        break;
      case _constants.KEY_VALUES.HOME:
        if (typeof min !== 'undefined') {
          event.preventDefault();
          onChangeValue(getSafeValue(min), event);
        }
        break;
      case _constants.KEY_VALUES.END:
        if (typeof max !== 'undefined') {
          event.preventDefault();
          onChangeValue(getSafeValue(max), event);
        }
        break;
      default:
        break;
    }
  });
  const handleWheel = (0, _hooks.useEventCallback)(event => {
    if (!scrollable) {
      event.preventDefault();
      return;
    }
    if (!disabled && !readOnly && event.target === document.activeElement) {
      event.preventDefault();
      const delta = event.wheelDelta || -event.deltaY || -event.detail;
      if (delta > 0) {
        onStepDown(event);
      }
      if (delta < 0) {
        onStepUp(event);
      }
    }
    onWheelProp === null || onWheelProp === void 0 || onWheelProp(event);
  });
  const restoreDecimalSeparator = (0, _react.useCallback)(value => {
    if (decimalSeparator && value) {
      // Handle both custom decimalSeparator and standard decimal point '.'
      if (decimalSeparator !== '.') {
        // Create a regex that matches both the custom separator and '.'
        const separatorRegex = new RegExp(`[${decimalSeparator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}.]`, 'g');
        return value.replace(separatorRegex, '.');
      }
      return value;
    }
    return value;
  }, [decimalSeparator]);
  const onBlur = event => {
    var _event$target;
    const value = restoreDecimalSeparator((_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value);
    const targetValue = Number.parseFloat(value);
    onChangeValue(getSafeValue(targetValue), event);
    setIsFocused(false);
  };
  const onFocus = () => {
    setIsFocused(true);
  };

  // wheel events
  (0, _useWheelHandler.useWheelHandler)(inputRef, handleWheel, scrollable);
  return {
    inputRef,
    isFocused,
    onStepUp,
    onStepDown,
    onKeyDown,
    onBlur,
    onFocus
  };
}