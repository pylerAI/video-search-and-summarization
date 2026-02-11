'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
const Indicator = ({
  style,
  classPrefix
}) => {
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('indicator'),
    style: style
  });
};
Indicator.displayName = 'Indicator';
var _default = exports.default = Indicator;