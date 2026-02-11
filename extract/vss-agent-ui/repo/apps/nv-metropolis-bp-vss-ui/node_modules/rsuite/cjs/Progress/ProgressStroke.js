'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _Tooltip = _interopRequireDefault(require("../Tooltip"));
var _Whisper = _interopRequireDefault(require("../Whisper"));
/**
 * A single stroke component used within ProgressLine
 */
const ProgressStroke = /*#__PURE__*/_react.default.memo(props => {
  const {
    classPrefix,
    percent,
    color,
    vertical,
    children,
    isSection,
    tooltip,
    style,
    countPercent
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);

  // Build class names
  const classes = prefix('stroke', {
    section: isSection
  });
  const content = /*#__PURE__*/_react.default.createElement("div", {
    className: classes,
    style: (0, _utils.mergeStyles)(style, {
      width: vertical ? '100%' : `${percent}%`,
      height: vertical ? `${percent}%` : '100%',
      background: color,
      bottom: vertical ? `${countPercent}%` : undefined
    })
  }, children);
  return tooltip ? /*#__PURE__*/_react.default.createElement(_Whisper.default, {
    trigger: "hover",
    placement: "top",
    speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, null, tooltip)
  }, content) : content;
});
ProgressStroke.displayName = 'ProgressStroke';
var _default = exports.default = ProgressStroke;