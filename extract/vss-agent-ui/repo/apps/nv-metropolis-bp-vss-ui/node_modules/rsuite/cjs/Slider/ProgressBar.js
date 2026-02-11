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
const ProgressBar = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    classPrefix = 'slider-progress-bar',
    vertical,
    end = 0,
    start = 0,
    style,
    className,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const sizeKey = vertical ? 'height' : 'width';
  const startKey = vertical ? 'bottom' : 'insetInlineStart';
  const styles = (0, _utils.mergeStyles)(style, {
    [startKey]: `${start}%`,
    [sizeKey]: `${end - start}%`
  });
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    style: styles,
    className: classes,
    "data-testid": "slider-progress-bar"
  }, rest));
});
ProgressBar.displayName = 'ProgressBar';
var _default = exports.default = ProgressBar;