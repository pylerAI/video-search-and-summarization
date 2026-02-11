'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _upperFirst = _interopRequireDefault(require("lodash/upperFirst"));
var _utils = require("../../internals/utils");
var _date = require("../../internals/utils/date");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
const GridHeaderRow = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-table',
    ...rest
  } = props;
  const {
    locale,
    showWeekNumbers,
    weekStart
  } = (0, _hooks2.useCalendar)();
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, prefix('row', 'header-row'));
  const weeks = (0, _date.getWeekKeys)(weekStart);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "row"
  }, rest, {
    ref: ref,
    className: classes
  }), showWeekNumbers && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('header-cell'),
    role: "columnheader"
  }), weeks.map(key => /*#__PURE__*/_react.default.createElement("div", {
    key: key,
    className: prefix('header-cell'),
    role: "columnheader",
    "aria-label": (0, _upperFirst.default)(key)
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('header-cell-content')
  }, locale === null || locale === void 0 ? void 0 : locale[key]))));
});
GridHeaderRow.displayName = 'CalendarGridHeaderRow';
var _default = exports.default = GridHeaderRow;