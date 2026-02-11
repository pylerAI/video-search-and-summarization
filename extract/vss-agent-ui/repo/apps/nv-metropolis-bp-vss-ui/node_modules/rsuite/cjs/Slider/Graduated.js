'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Mark = _interopRequireDefault(require("./Mark"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _utils2 = require("./utils");
const Graduated = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    step,
    min,
    max,
    count,
    value,
    classPrefix = 'slider',
    className,
    marks = [],
    renderMark,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const activeIndexs = [];
  let startIndex = 0;
  let endIndex = 0;
  if (Array.isArray(value)) {
    const [start, end] = value;
    startIndex = (0, _utils2.precisionMath)(start / step - min / step);
    endIndex = (0, _utils2.precisionMath)(end / step - min / step);
    activeIndexs.push((0, _utils2.precisionMath)(Math.ceil((start - min) / (max - min) * count)));
    activeIndexs.push((0, _utils2.precisionMath)(Math.ceil((end - min) / (max - min) * count)));
  } else {
    endIndex = (0, _utils2.precisionMath)(value / step - min / step);
    activeIndexs.push((0, _utils2.precisionMath)(Math.ceil((value - min) / (max - min) * count)));
  }
  const graduatedItems = [];

  // If custom marks are provided, use them
  if (marks.length > 0) {
    // Only create DOM nodes for the specific mark values
    marks.forEach((mark, index) => {
      // Calculate the position index for this mark
      const markPosition = (0, _utils2.precisionMath)((mark.value - min) / (max - min) * count);
      graduatedItems.push(/*#__PURE__*/_react.default.createElement("li", {
        className: prefix('tick'),
        key: `${mark.value}-${index}`,
        "data-pass": markPosition >= startIndex && markPosition <= endIndex,
        "data-active": activeIndexs.indexOf(markPosition) !== -1,
        style: cssVar('tick-offset', `${(mark.value - min) / (max - min) * 100}%`)
      }, /*#__PURE__*/_react.default.createElement(_Mark.default, {
        mark: mark.value,
        renderMark: () => mark.label || mark.value
      })));
    });
  } else {
    // Original implementation for when no custom marks are provided
    for (let i = 0; i < count; i += 1) {
      const mark = (0, _utils2.precisionMath)(i * step + min);
      const lastMark = Math.min(max, mark + step);
      const last = i === count - 1;
      graduatedItems.push(/*#__PURE__*/_react.default.createElement("li", {
        className: prefix('tick'),
        "data-pass": i >= startIndex && i <= endIndex,
        "data-active": activeIndexs.indexOf(i) !== -1,
        key: i
      }, /*#__PURE__*/_react.default.createElement(_Mark.default, {
        mark: mark,
        renderMark: renderMark
      }), last ? /*#__PURE__*/_react.default.createElement(_Mark.default, {
        mark: lastMark,
        renderMark: renderMark,
        last: last
      }) : null));
    }
  }
  const classes = merge(className, prefix('graduator'));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest, {
    "data-with-marks": marks.length > 0
  }), /*#__PURE__*/_react.default.createElement("ol", null, graduatedItems));
});
Graduated.displayName = 'Graduated';
var _default = exports.default = Graduated;