'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ProgressStroke = _interopRequireDefault(require("./ProgressStroke"));
var _hooks = require("../internals/hooks");
/**
 * A component to render multiple sections in a progress bar
 */
const ProgressSections = /*#__PURE__*/_react.default.memo(props => {
  const {
    classPrefix,
    sections,
    vertical,
    ...rest
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  let countPercent = 0;
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: prefix('sections')
  }, rest), sections.map((section, index) => {
    const sectionStroke = /*#__PURE__*/_react.default.createElement(_ProgressStroke.default, {
      key: index,
      classPrefix: classPrefix,
      percent: section.percent,
      color: section.color,
      vertical: vertical,
      isSection: true,
      tooltip: section.tooltip,
      countPercent: countPercent
    }, section.label);
    countPercent += section.percent;
    return sectionStroke;
  }));
});
ProgressSections.displayName = 'ProgressSections';
var _default = exports.default = ProgressSections;