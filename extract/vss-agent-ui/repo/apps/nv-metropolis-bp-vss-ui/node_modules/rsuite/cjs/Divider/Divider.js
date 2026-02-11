'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _StyledBox = _interopRequireDefault(require("../internals/StyledBox"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The Divider component is used to separate content.
 * @see https://rsuitejs.com/components/divider
 */
const Divider = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Divider', props);
  const {
    as,
    appearance,
    className,
    classPrefix = 'divider',
    children,
    color,
    label = children,
    labelPlacement,
    vertical,
    spacing,
    style,
    size,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const styles = (0, _utils.mergeStyles)(style, (0, _utils.getSizeStyle)(spacing, 'divider', 'spacing'));
  return /*#__PURE__*/_react.default.createElement(_StyledBox.default, (0, _extends2.default)({
    as: as,
    name: "divider",
    role: "separator",
    ref: ref,
    className: classes,
    style: styles,
    size: size,
    color: color,
    "data-appearance": appearance,
    "data-orientation": vertical ? 'vertical' : 'horizontal',
    "data-with-label": label ? 'true' : undefined,
    "data-placement": labelPlacement
  }, rest), label);
});
Divider.displayName = 'Divider';
var _default = exports.default = Divider;