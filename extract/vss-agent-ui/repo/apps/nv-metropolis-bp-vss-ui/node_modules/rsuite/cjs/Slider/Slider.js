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
var _ProgressBar = _interopRequireDefault(require("./ProgressBar"));
var _Handle = _interopRequireDefault(require("./Handle"));
var _Graduated = _interopRequireDefault(require("./Graduated"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A Slider is an interface for users to adjust a value in a specific range.
 *
 * @see https://rsuitejs.com/components/slider
 */
const Slider = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Slider', props);
  const {
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'aria-valuetext': ariaValuetext,
    as,
    className,
    classPrefix = 'slider',
    barClassName,
    defaultValue = 0,
    disabled,
    progress,
    graduated,
    handleClassName,
    handleStyle,
    handleTitle,
    keepTooltipOpen,
    readOnly,
    step = 1,
    size = 'sm',
    tooltip = true,
    max: maxProp = 100,
    placeholder,
    plaintext,
    marks,
    min = 0,
    vertical,
    value: valueProp,
    getAriaValueText,
    renderTooltip,
    renderMark,
    onChange,
    onChangeCommitted,
    ...rest
  } = propsWithDefaults;
  const barRef = (0, _react.useRef)(null);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    rtl
  } = (0, _hooks.useCustom)('Slider');
  const classes = merge(className, withPrefix());
  const max = (0, _react.useMemo)(() => (0, _utils2.precisionMath)(Math.floor((maxProp - min) / step) * step + min), [maxProp, min, step]);

  /**
   * Returns a valid value that does not exceed the specified range of values.
   */
  const getValidValue = (0, _react.useCallback)(value => {
    return (0, _utils2.checkValue)(value, min, max);
  }, [max, min]);
  const [value, setValue] = (0, _hooks.useControlled)(getValidValue(valueProp), getValidValue(defaultValue));
  const count = (0, _react.useMemo)(() => (0, _utils2.precisionMath)((max - min) / step), [max, min, step]);

  // Get the height of the progress bar
  const getBarHeight = (0, _react.useCallback)(() => barRef.current ? (0, _getHeight.default)(barRef.current) : 0, []);
  // Get the width of the progress bar
  const getBarWidth = (0, _react.useCallback)(() => barRef.current ? (0, _getWidth.default)(barRef.current) : 0, []);
  const getValueByOffset = (0, _react.useCallback)(offset => {
    let value = 0;
    if (isNaN(offset)) {
      return value;
    }
    if (vertical) {
      const barHeight = getBarHeight();
      value = Math.round(offset / (barHeight / count)) * step;
    } else {
      const barWidth = getBarWidth();
      value = Math.round(offset / (barWidth / count)) * step;
    }
    return (0, _utils2.precisionMath)(value);
  }, [count, getBarHeight, getBarWidth, step, vertical]);

  /**
   * A value within the valid range is calculated from the position triggered by the event.
   */
  const getValueByPosition = (0, _react.useCallback)(event => {
    const barOffset = (0, _getOffset.default)(barRef.current);
    const {
      pageX,
      pageY
    } = (0, _utils2.getPosition)(event);
    let offset;
    if (vertical) {
      // For vertical sliders, top is 0% and bottom is 100% in both LTR and RTL
      offset = barOffset.top + barOffset.height - pageY;
    } else {
      // For horizontal sliders, handle RTL direction
      offset = pageX - barOffset.left;
      if (rtl) {
        // In RTL, invert the offset so that dragging right decreases the value
        offset = barOffset.width - offset;
      }
    }
    return getValueByOffset(offset) + min;
  }, [getValueByOffset, min, rtl, vertical]);

  /**
   * Callback function that is fired when the mousemove is triggered
   */
  const handleChangeValue = (0, _hooks.useEventCallback)(event => {
    if (disabled || readOnly) {
      return;
    }
    const nextValue = getValidValue(getValueByPosition(event));
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  });

  /**
   * Callback function that is fired when the mouseup is triggered
   */
  const handleChangeCommitted = (0, _hooks.useEventCallback)(event => {
    if (disabled || readOnly) {
      return;
    }
    const nextValue = getValidValue(getValueByPosition(event));
    onChangeCommitted === null || onChangeCommitted === void 0 || onChangeCommitted(nextValue, event);
  });
  const handleClickBar = (0, _hooks.useEventCallback)(event => {
    handleChangeValue(event);
    handleChangeCommitted(event);
  });
  const handleKeyDown = (0, _hooks.useEventCallback)(event => {
    let nextValue;
    const increaseKey = rtl ? 'ArrowLeft' : 'ArrowRight';
    const decreaseKey = rtl ? 'ArrowRight' : 'ArrowLeft';
    switch (event.key) {
      case 'Home':
        nextValue = min;
        break;
      case 'End':
        nextValue = max;
        break;
      case increaseKey:
      case 'ArrowUp':
        nextValue = Math.min(max, value + step);
        break;
      case decreaseKey:
      case 'ArrowDown':
        nextValue = Math.max(min, value - step);
        break;
      default:
        return;
    }

    // Prevent scroll of the page
    event.preventDefault();
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  });
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      localeKey: "notSelected",
      ref: ref,
      placeholder: placeholder
    }, value);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    role: "presentation",
    className: classes,
    "data-size": size,
    "data-disabled": disabled,
    "data-readonly": readOnly,
    "data-graduated": graduated,
    "data-with-mark": renderMark ? 'true' : undefined,
    "data-direction": vertical ? 'vertical' : 'horizontal'
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    ref: barRef,
    className: merge(barClassName, prefix('bar')),
    onClick: handleClickBar,
    "data-testid": "slider-bar"
  }, progress && /*#__PURE__*/_react.default.createElement(_ProgressBar.default, {
    vertical: vertical,
    start: 0,
    end: (value - min) / (max - min) * 100
  }), graduated && /*#__PURE__*/_react.default.createElement(_Graduated.default, {
    step: step,
    min: min,
    max: max,
    count: count,
    value: value,
    marks: marks,
    renderMark: renderMark
  })), /*#__PURE__*/_react.default.createElement(_Handle.default, {
    position: (value - min) / (max - min) * 100,
    className: handleClassName,
    style: handleStyle,
    disabled: disabled,
    vertical: vertical,
    tooltip: tooltip,
    value: value,
    keepTooltipOpen: keepTooltipOpen,
    renderTooltip: renderTooltip,
    onDragMove: handleChangeValue,
    onKeyDown: handleKeyDown,
    onDragEnd: handleChangeCommitted,
    tabIndex: disabled || readOnly ? undefined : 0,
    "aria-orientation": vertical ? 'vertical' : 'horizontal',
    "aria-valuenow": value,
    "aria-disabled": disabled,
    "aria-valuetext": getAriaValueText ? getAriaValueText(value) : ariaValuetext,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledby,
    "aria-valuemax": max,
    "aria-valuemin": min
  }, handleTitle));
});
Slider.displayName = 'Slider';
var _default = exports.default = Slider;