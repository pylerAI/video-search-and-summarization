'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ScrollView = _interopRequireDefault(require("../../internals/ScrollView"));
const TimeColumn = props => {
  const {
    prefix,
    title,
    children,
    ...rest
  } = props;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('column')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('column-title')
  }, title), /*#__PURE__*/_react.default.createElement(_ScrollView.default, (0, _extends2.default)({
    customScrollbar: true,
    as: "ul",
    role: "listbox"
  }, rest), children));
};
var _default = exports.default = TimeColumn;