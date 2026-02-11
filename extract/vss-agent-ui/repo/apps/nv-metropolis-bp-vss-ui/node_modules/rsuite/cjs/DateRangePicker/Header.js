'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
var _date = require("../internals/utils/date");
var _FormattedDate = require("../internals/intl/FormattedDate");
var _Button = _interopRequireDefault(require("../Button"));
function Header(props) {
  const {
    prefix
  } = (0, _hooks.useStyles)('picker');
  const {
    formatStr,
    character,
    value,
    activeKey = 'start',
    clickable,
    onSelect
  } = props;
  const [startDate, endDate] = value !== null && value !== void 0 ? value : [null, null];
  const v = startDate && endDate ? [startDate, endDate].sort(_date.compareAsc) : [startDate, endDate];
  const start = v[0] ? /*#__PURE__*/_react.default.createElement(_FormattedDate.FormattedDate, {
    date: v[0],
    formatStr: formatStr
  }) : formatStr;
  const end = v[1] ? /*#__PURE__*/_react.default.createElement(_FormattedDate.FormattedDate, {
    date: v[1],
    formatStr: formatStr
  }) : formatStr;
  return /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('daterange-header', {
      [`tab-active-${activeKey}`]: clickable
    }),
    "data-testid": "daterange-header"
  }, clickable ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement(_Button.default, {
    size: "xs",
    appearance: "subtle",
    className: prefix('header-date'),
    onClick: () => onSelect === null || onSelect === void 0 ? void 0 : onSelect('start'),
    "aria-label": "Select start date"
  }, start), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('header-character')
  }, character), /*#__PURE__*/_react.default.createElement(_Button.default, {
    size: "xs",
    appearance: "subtle",
    className: prefix('header-date'),
    onClick: () => onSelect === null || onSelect === void 0 ? void 0 : onSelect('end'),
    "aria-label": "Select end date"
  }, end)) : /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('header-date')
  }, start), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('header-character')
  }, character), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('header-date')
  }, end)));
}
var _default = exports.default = Header;