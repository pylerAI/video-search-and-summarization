'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../Box"));
var _utils = require("../utils");
const StyledBox = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    color,
    name: componentName,
    style,
    size,
    ...rest
  } = props;
  const boxStyle = (0, _utils.mergeStyles)(style, (0, _utils.getSizeStyle)(size, componentName), (0, _utils.getColorStyle)(color, componentName));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    style: boxStyle
  }, rest));
});
StyledBox.displayName = 'StyledBox';
var _default = exports.default = StyledBox;