'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _InfoOutline = _interopRequireDefault(require("@rsuite/icons/InfoOutline"));
var _Whisper = _interopRequireDefault(require("../Whisper"));
var _Tooltip = _interopRequireDefault(require("../Tooltip"));
var _IconButton = _interopRequireDefault(require("../IconButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const StatLabel = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'dt',
    classPrefix = 'stat-label',
    className,
    children,
    info,
    uppercase,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    uppercase
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), children, info && /*#__PURE__*/_react.default.createElement(_Whisper.default, {
    placement: "top",
    trigger: 'click',
    enterable: true,
    speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, null, info)
  }, /*#__PURE__*/_react.default.createElement(_IconButton.default, {
    circle: true,
    size: "xs",
    appearance: "subtle",
    icon: /*#__PURE__*/_react.default.createElement(_InfoOutline.default, null)
  })));
});
StatLabel.displayName = 'StatLabel';
var _default = exports.default = StatLabel;