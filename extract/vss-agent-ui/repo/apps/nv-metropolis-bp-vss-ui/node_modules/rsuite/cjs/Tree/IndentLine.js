'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
const IndentLine = () => {
  const {
    prefix
  } = (0, _hooks.useStyles)('tree');
  return /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('indent-line'),
    "data-testid": "indent-line"
  });
};
var _default = exports.default = IndentLine;