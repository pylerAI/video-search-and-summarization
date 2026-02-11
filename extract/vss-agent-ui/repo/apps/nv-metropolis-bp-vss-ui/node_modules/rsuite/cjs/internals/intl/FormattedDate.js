'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.FormattedDate = FormattedDate;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../hooks");
function FormattedDate({
  date,
  formatStr
}) {
  const {
    formatDate
  } = (0, _hooks.useCustom)('Calendar');
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, formatDate(date, formatStr));
}
var _default = exports.default = FormattedDate;