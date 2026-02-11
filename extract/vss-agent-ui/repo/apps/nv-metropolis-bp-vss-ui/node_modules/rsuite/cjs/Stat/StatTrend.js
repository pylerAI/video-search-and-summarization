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
const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.5',
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
};
const ArrowUp = props => {
  return /*#__PURE__*/_react.default.createElement("svg", (0, _extends2.default)({}, svgProps, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M17 7l-10 10"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M8 7l9 0l0 9"
  }));
};
const ArrowDown = props => {
  return /*#__PURE__*/_react.default.createElement("svg", (0, _extends2.default)({}, svgProps, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M7 7l10 10"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M17 8l0 9l-9 0"
  }));
};
const ArrowEqual = props => {
  return /*#__PURE__*/_react.default.createElement("svg", (0, _extends2.default)({}, svgProps, props), /*#__PURE__*/_react.default.createElement("path", {
    d: "M7 9l10 0"
  }), /*#__PURE__*/_react.default.createElement("path", {
    d: "M7 15l10 0"
  }));
};
const StatTrend = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'span',
    appearance = 'default',
    classPrefix = 'stat-trend',
    indicator = 'up',
    className,
    children,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix(appearance, indicator));
  const IndicatorIcon = indicator === 'up' ? ArrowUp : indicator === 'down' ? ArrowDown : ArrowEqual;
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), children, /*#__PURE__*/_react.default.createElement(IndicatorIcon, {
    className: prefix('indicator')
  }));
});
StatTrend.displayName = 'StatTrend';
var _default = exports.default = StatTrend;