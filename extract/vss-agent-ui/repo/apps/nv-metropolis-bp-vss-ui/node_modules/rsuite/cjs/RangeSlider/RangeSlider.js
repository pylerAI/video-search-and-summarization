'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _getWidth = _interopRequireDefault(require("dom-lib/getWidth"));
var _getHeight = _interopRequireDefault(require("dom-lib/getHeight"));
var _getOffset = _interopRequireDefault(require("dom-lib/getOffset"));
var _ProgressBar = _interopRequireDefault(require("../Slider/ProgressBar"));
var _Handle = _interopRequireDefault(require("../Slider/Handle"));
var _Graduated = _interopRequireDefault(require("../Slider/Graduated"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _utils2 = require("../Slider/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const defaultDefaultValue = [0, 0];

/**
 * The `RangeSlider` component is used to select a range from a given numerical range.
 * @see https://rsuitejs.com/components/slider/
 */
const RangeSlider = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('RangeSlider', props);
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-valuetext': ariaValuetext,
    as,
    barClassName,
    className,
    classPrefix = 'slider',
    constraint,
    defaultValue = defaultDefaultValue,
    disabled,
    graduated,
    progress = true,
    keepTooltipOpen = false,
    vertical,
    readOnly,
    min = 0,
    max: maxProp = 100,
    step = 1,
    size = 'sm',
    value: valueProp,
    handleClassName,
    handleStyle,
    handleTitle,
    tooltip = true,
    marks,
    plaintext,
    placeholder,
    getAriaValueText,
    renderTooltip,
    renderMark,
    onChange,
    onChangeCommitted,
    ...rest
  } = propsWithDefaults;
  const barRef = (0, _react.useRef)(null);

  // Define the parameter position of the handle
  const handleIndexs = (0, _react.useRef)([0, 1]);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    rtl
  } = (0, _hooks.useCustom)('RangeSlider');
  const classes = merge(className, withPrefix());
  const max = (0, _react.useMemo)(() => (0, _utils2.precisionMath)(Math.floor((maxProp - min) / step) * step + min), [maxProp, min, step]);

  /**
   * Returns a valid value that does not exceed the specified range of values.
   */
  const getValidValue = (0, _react.useCallback)(value => {
    if (typeof value === 'undefined') {
      return;
    }
    return [(0, _utils2.checkValue)(value[0], min, max), (0, _utils2.checkValue)(value[1], min, max)];
  }, [max, min]);
  const [value, setValue] = (0, _hooks.useControlled)(getValidValue(valueProp), getValidValue(defaultValue));

  // The count of values that can be entered.
  const count = (0, _react.useMemo)(() => (0, _utils2.precisionMath)((max - min) / step), [max, min, step]);

  // Get the height of the progress bar
  const getBarHeight = (0, _react.useCallback)(() => barRef.current ? (0, _getHeight.default)(barRef.current) : 0, []);
  // Get the width of the progress bar
  const getBarWidth = (0, _react.useCallback)(() => barRef.current ? (0, _getWidth.default)(barRef.current) : 0, []);
  const getValueByOffset = (0, _react.useCallback)(offset => {
    let val = 0;
    if (isNaN(offset)) {
      return val;
    }
    if (vertical) {
      const barHeight = getBarHeight();
      val = Math.round(offset / (barHeight / count)) * step;
    } else {
      const barWidth = getBarWidth();
      val = Math.round(offset / (barWidth / count)) * step;
    }
    return (0, _utils2.precisionMath)(val);
  }, [count, getBarHeight, getBarWidth, step, vertical]);
  const getValueByPosition = (0, _react.useCallback)(event => {
    const barOffset = (0, _getOffset.default)(barRef.current);
    const {
      pageX,
      pageY
    } = (0, _utils2.getPosition)(event);
    const offset = vertical ? barOffset.top + barOffset.height - pageY : pageX - barOffset.left;
    const val = rtl && !vertical ? barOffset.width - offset : offset;
    return getValueByOffset(val) + min;
  }, [getValueByOffset, min, rtl, vertical]);
  const getRangeValue = (0, _react.useCallback)((value, key, event) => {
    // Get the corresponding value according to the cursor position
    const v = getValueByPosition(event);

    // Judge the handle key and put the corresponding value at the start or end.
    if (key === 'start') {
      return [v, value[1]];
    } else if (key === 'end') {
      return [value[0], v];
    }
    return value;
  }, [getValueByPosition]);
  const getNextValue = (0, _react.useCallback)((event, dataset) => {
    const {
      key: eventKey,
      range
    } = dataset;
    const value = range.split(',').map(i => +i);
    const nextValue = getValidValue(getRangeValue(value, eventKey, event));
    if (nextValue[0] >= nextValue[1]) {
      /**
       * When the value of `start` is greater than the value of` end`,
       * the position of the handle is reversed.
       */
      handleIndexs.current.reverse();
      if (eventKey === 'start') {
        nextValue[0] = value[1];
      } else {
        nextValue[1] = value[0];
      }
    }
    return nextValue;
  }, [getRangeValue, getValidValue]);

  /**
   * Whether a range is valid against given constraint (if any)
   * Should check before every `setValue` calls
   */
  const isRangeMatchingConstraint = (0, _react.useCallback)(range => {
    // If no constraint is defined, any range is valid
    if (!constraint) return true;
    return constraint(range);
  }, [constraint]);

  /**
   * Callback function that is fired when the mousemove is triggered
   */
  const handleDragMove = (0, _hooks.useEventCallback)((event, dataset) => {
    if (disabled || readOnly) {
      return;
    }
    const nextValue = getNextValue(event, dataset);
    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }
  });

  /**
   * Callback function that is fired when the mouseup is triggered
   */
  const handleChangeCommitted = (0, _hooks.useEventCallback)((event, dataset) => {
    if (disabled || readOnly) {
      return;
    }
    const nextValue = getNextValue(event, dataset);
    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChangeCommitted === null || onChangeCommitted === void 0 || onChangeCommitted(nextValue, event);
    }
  });
  const handleKeyDown = (0, _hooks.useEventCallback)(event => {
    const target = event.target;
    const {
      key
    } = (target === null || target === void 0 ? void 0 : target.dataset) || {};
    const nextValue = [...value];
    const increaseKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const decreaseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    const valueIndex = key === 'start' ? 0 : 1;
    switch (event.key) {
      case 'Home':
        nextValue[valueIndex] = min;
        break;
      case 'End':
        nextValue[valueIndex] = max;
        break;
      case increaseKey:
      case 'ArrowUp':
        nextValue[valueIndex] = Math.min(max, value[valueIndex] + step);
        break;
      case decreaseKey:
      case 'ArrowDown':
        nextValue[valueIndex] = Math.max(min, value[valueIndex] - step);
        break;
      default:
        return;
    }

    // When the start value is greater than the end value, let the handle and value switch positions.
    if (nextValue[0] >= nextValue[1]) {
      nextValue.reverse();
      handleIndexs.current.reverse();
    }

    // Prevent scroll of the page
    event.preventDefault();
    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }
  });
  const handleBarClick = (0, _hooks.useEventCallback)(event => {
    if (disabled || readOnly) {
      return;
    }
    let [start, end] = value;
    const v = getValueByPosition(event);

    // Judging that the current click value is closer to the values of `start` and `end`.
    if (Math.abs(start - v) < Math.abs(end - v)) {
      start = v;
    } else {
      end = v;
    }
    const nextValue = getValidValue([start, end].sort((a, b) => a - b));
    if (isRangeMatchingConstraint(nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 || onChange(nextValue, event);
      onChangeCommitted === null || onChangeCommitted === void 0 || onChangeCommitted(nextValue, event);
    }
  });
  const handleProps = (0, _react.useMemo)(() => [{
    value: value[0],
    'data-key': 'start',
    'aria-valuenow': value[0],
    'aria-valuetext': getAriaValueText ? getAriaValueText(value[0], 'start') : ariaValuetext,
    position: (value[0] - min) / (max - min) * 100
  }, {
    value: value[1],
    'data-key': 'end',
    'aria-valuenow': value[1],
    'aria-valuetext': getAriaValueText ? getAriaValueText(value[1], 'end') : ariaValuetext,
    position: (value[1] - min) / (max - min) * 100
  }], [ariaValuetext, getAriaValueText, max, min, value]);
  const handleCommonProps = {
    disabled,
    vertical,
    tooltip,
    className: handleClassName,
    style: handleStyle,
    renderTooltip,
    onDragMove: handleDragMove,
    onDragEnd: handleChangeCommitted,
    onKeyDown: handleKeyDown,
    tabIndex: disabled ? undefined : 0,
    'aria-orientation': vertical ? 'vertical' : 'horizontal',
    'aria-disabled': disabled,
    'aria-valuemax': max,
    'aria-valuemin': min,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    keepTooltipOpen
  };
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      localeKey: "notSelected",
      ref: ref,
      placeholder: placeholder
    }, value && (value[0] || value[1]) ? value.join('~') : null);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-size": size,
    "data-disabled": disabled,
    "data-readonly": readOnly,
    "data-graduated": graduated,
    "data-direction": vertical ? 'vertical' : 'horizontal',
    "data-with-mark": renderMark ? 'true' : undefined
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: merge(barClassName, prefix('bar')),
    ref: barRef,
    onClick: handleBarClick
  }, progress && /*#__PURE__*/_react.default.createElement(_ProgressBar.default, {
    vertical: vertical,
    start: (value[0] - min) / (max - min) * 100,
    end: (value[1] - min) / (max - min) * 100
  }), graduated && /*#__PURE__*/_react.default.createElement(_Graduated.default, {
    step: step,
    min: min,
    max: max,
    count: count,
    value: value,
    marks: marks,
    renderMark: renderMark
  })), /*#__PURE__*/_react.default.createElement(_Handle.default, (0, _extends2.default)({
    "data-range": value
  }, handleCommonProps, handleProps[handleIndexs.current[0]]), handleTitle), /*#__PURE__*/_react.default.createElement(_Handle.default, (0, _extends2.default)({
    "data-range": value
  }, handleCommonProps, handleProps[handleIndexs.current[1]]), handleTitle));
});
RangeSlider.displayName = 'RangeSlider';
var _default = exports.default = RangeSlider;