'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _reactTextareaAutosize = _interopRequireDefault(require("react-textarea-autosize"));
var _InputBase = _interopRequireDefault(require("../internals/InputBase"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Textarea = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Textarea', props);
  const {
    rows = 3,
    classPrefix = 'textarea',
    className,
    size = 'md',
    autosize,
    maxRows,
    minRows,
    resize,
    style,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const styles = (0, _utils.mergeStyles)(style, cssVar('resize', resize));
  const autosizeProps = autosize ? {
    maxRows,
    minRows
  } : {};
  return /*#__PURE__*/_react.default.createElement(_InputBase.default, (0, _extends2.default)({
    as: autosize ? _reactTextareaAutosize.default : 'textarea',
    ref: ref,
    size: size,
    rows: rows,
    className: classes,
    style: styles
  }, autosizeProps, rest));
});
Textarea.displayName = 'Textarea';
var _default = exports.default = Textarea;