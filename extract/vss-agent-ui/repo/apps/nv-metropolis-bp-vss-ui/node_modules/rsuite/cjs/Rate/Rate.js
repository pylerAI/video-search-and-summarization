'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _Star = _interopRequireDefault(require("@rsuite/icons/Star"));
var _Character = _interopRequireDefault(require("./Character"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _StyledBox = _interopRequireDefault(require("../internals/StyledBox"));
var _constants = require("../internals/constants");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _utils2 = require("./utils");
var _useRatingStates = require("./useRatingStates");
/**
 * The `Rate` component is used for rating. It can be used to evaluate the quality of the content.
 * @see https://rsuitejs.com/components/rate/
 */
const Rate = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Rate', props);
  const {
    as = 'ul',
    character = /*#__PURE__*/_react.default.createElement(_Star.default, null),
    className,
    classPrefix = 'rate',
    disabled,
    max = 5,
    name,
    readOnly,
    vertical,
    size,
    color,
    allowHalf = false,
    value: valueProp,
    defaultValue = 0,
    cleanable = true,
    plaintext,
    style,
    onChange,
    renderCharacter,
    onChangeActive,
    ...rest
  } = propsWithDefaults;
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());

  // Use the custom hook to manage rating star states
  const {
    starStates,
    setStarStates,
    resetStarStates,
    hoverValue,
    getStarStates
  } = (0, _useRatingStates.useRatingStates)({
    value,
    max,
    allowHalf,
    valueProp
  });
  const handleMouseLeave = (0, _hooks.useEventCallback)(event => {
    resetStarStates();
    onChangeActive === null || onChangeActive === void 0 || onChangeActive(value, event);
  });
  const handleChangeValue = (0, _hooks.useEventCallback)((index, event) => {
    let nextValue = (0, _utils2.transformStarStatusToValue)(starStates);
    if (cleanable && value === nextValue && getStarStates(value)[index] === starStates[index]) {
      nextValue = 0;
    }
    if (nextValue !== value) {
      setValue(nextValue);
      setStarStates(getStarStates(nextValue));
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }
  });
  const handleKeyDown = (0, _hooks.useEventCallback)((index, event) => {
    const {
      key
    } = event;
    let nextValue = (0, _utils2.transformStarStatusToValue)(starStates);
    if (key === _constants.KEY_VALUES.RIGHT && nextValue < max) {
      nextValue = allowHalf ? nextValue + 0.5 : nextValue + 1;
    } else if (key === _constants.KEY_VALUES.LEFT && nextValue > 0) {
      nextValue = allowHalf ? nextValue - 0.5 : nextValue - 1;
    }
    setStarStates(getStarStates(nextValue));
    if (key === _constants.KEY_VALUES.ENTER) {
      handleChangeValue(index, event);
    }
  });
  const handleChangeStarStates = (0, _hooks.useEventCallback)((index, key, event) => {
    const nextStarStates = starStates.map((_item, i) => {
      if (i === index && key === 'before' && allowHalf) {
        return 0.5;
      }
      return index >= i ? 1 : 0;
    });
    if (!(0, _utils.shallowEqualArray)(starStates, nextStarStates)) {
      setStarStates(nextStarStates);
      onChangeActive === null || onChangeActive === void 0 || onChangeActive((0, _utils2.transformStarStatusToValue)(nextStarStates), event);
    }
  });
  const handleClick = (0, _hooks.useEventCallback)((index, key, event) => {
    handleChangeStarStates(index, key, event);
    handleChangeValue(index, event);
  });
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      localeKey: "notSelected",
      className: className
    }, !(0, _isNil.default)(value) ? `${value}/${max}` : null);
  }
  const mergedStyle = (0, _utils.mergeStyles)(style, {
    '--rs-rate-before-size': (0, _utils2.getFractionalValue)(value)
  });
  return /*#__PURE__*/_react.default.createElement(_StyledBox.default, (0, _extends2.default)({
    as: as,
    name: "rate",
    size: size,
    color: color,
    role: "radiogroup",
    tabIndex: disabled ? -1 : 0,
    ref: ref,
    className: classes,
    style: mergedStyle,
    onMouseLeave: handleMouseLeave,
    "data-disabled": disabled,
    "data-readonly": readOnly,
    "data-name": name
  }, rest), starStates.map((status, index) => /*#__PURE__*/_react.default.createElement(_Character.default, {
    role: "radio",
    "aria-posinset": index + 1,
    "aria-setsize": max,
    "aria-checked": value === index + 1,
    key: index,
    status: status,
    disabled: disabled || readOnly,
    vertical: vertical,
    onClick: (key, event) => handleClick(index, key, event),
    onKeyDown: event => handleKeyDown(index, event),
    onMouseMove: (key, event) => handleChangeStarStates(index, key, event)
  }, renderCharacter ? renderCharacter(hoverValue, index) : character)));
});
Rate.displayName = 'Rate';
var _default = exports.default = Rate;