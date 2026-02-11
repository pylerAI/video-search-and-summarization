'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 *
 * The `Text` component is used to display text.
 *
 * @see https://rsuitejs.com/components/text
 */
const Text = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Text', props);
  const {
    as = 'p',
    align,
    classPrefix = 'text',
    color,
    className,
    maxLines,
    weight,
    muted,
    transform,
    size,
    style,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    cssVar,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix(align, weight, transform, {
    muted,
    ellipsis: maxLines
  }));
  const styles = (0, _utils.mergeStyles)(style, (0, _utils.getSizeStyle)(size, 'font'), cssVar('max-lines', maxLines));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    c: color,
    ref: ref,
    className: classes,
    style: styles
  }, rest));
});
Text.displayName = 'Text';
var _default = exports.default = Text;