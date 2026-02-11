'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _ProgressInfo = _interopRequireDefault(require("./ProgressInfo"));
var _ProgressStroke = _interopRequireDefault(require("./ProgressStroke"));
var _ProgressSections = _interopRequireDefault(require("./ProgressSections"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `Progress.Line` component is used to display the progress of current operation.
 * @see https://rsuitejs.com/components/progress/#line
 */
const ProgressLine = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('ProgressLine', props);
  const {
    as,
    className,
    classPrefix = 'progress-line',
    percent = 0,
    percentPlacement = 'end',
    radius,
    strokeColor,
    strokeWidth,
    status,
    striped,
    style,
    showInfo = true,
    trailColor,
    trailWidth,
    vertical,
    sections,
    renderInfo,
    indeterminate,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    prefix,
    withPrefix,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    vertical,
    striped,
    indeterminate
  }));
  const totalPercent = sections ? sections.reduce((sum, section) => sum + section.percent, 0) : percent;
  const styles = (0, _utils.mergeStyles)(cssVar('trail-size', (0, _utils.getCssValue)(trailWidth || strokeWidth)), cssVar('trail-color', trailColor), cssVar('stroke', `${totalPercent}%`), cssVar('size', (0, _utils.getCssValue)(strokeWidth)), cssVar('color', strokeColor), cssVar('radius', (0, _utils.getCssValue)(radius)), style);
  const info = /*#__PURE__*/_react.default.createElement(_ProgressInfo.default, {
    percent: percent,
    renderInfo: renderInfo,
    status: status,
    classPrefix: classPrefix
  });

  // Determine if the info should be placed inside the stroke
  const isInsidePlacement = percentPlacement === null || percentPlacement === void 0 ? void 0 : percentPlacement.startsWith('inside');
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": totalPercent,
    "data-status": status,
    "data-placement": percentPlacement,
    style: styles
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('outer')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('trail')
  }, sections ? /*#__PURE__*/_react.default.createElement(_ProgressSections.default, {
    classPrefix: classPrefix,
    sections: sections,
    vertical: vertical
  }) : /*#__PURE__*/_react.default.createElement(_ProgressStroke.default, {
    classPrefix: classPrefix,
    percent: indeterminate ? 100 : percent,
    vertical: vertical
  }, showInfo && isInsidePlacement ? info : null))), showInfo && !isInsidePlacement ? info : null);
});
ProgressLine.displayName = 'ProgressLine';
var _default = exports.default = ProgressLine;