'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
/**
 * A component to render multiple sections in a circular progress bar
 */
const ProgressCircleSections = /*#__PURE__*/_react.default.memo(props => {
  const {
    classPrefix,
    sections,
    pathString,
    strokeLinecap,
    strokeWidth,
    gapDegree,
    totalPercent
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  let startPercent = 0;
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, sections.map((section, index) => {
    const sectionLen = Math.PI * 2 * (50 - strokeWidth / 2);
    const gapLength = gapDegree / 360 * sectionLen;
    const sectionPercent = section.percent;
    const endPercent = startPercent + sectionPercent;

    // Calculate the stroke dash array and offset for this section
    const sectionStyle = {
      stroke: section.color,
      strokeDasharray: `${sectionPercent / 100 * (sectionLen - gapLength)}px ${sectionLen}px`,
      strokeDashoffset: `-${gapLength / 2 + startPercent / 100 * (sectionLen - gapLength)}px`
    };
    const sectionPath = /*#__PURE__*/_react.default.createElement("path", {
      key: index,
      d: pathString,
      strokeLinecap: strokeLinecap,
      className: prefix('stroke'),
      strokeWidth: totalPercent === 0 ? 0 : strokeWidth,
      fillOpacity: "0",
      style: sectionStyle
    });
    startPercent = endPercent;
    return sectionPath;
  }));
});
ProgressCircleSections.displayName = 'ProgressCircleSections';
var _default = exports.default = ProgressCircleSections;