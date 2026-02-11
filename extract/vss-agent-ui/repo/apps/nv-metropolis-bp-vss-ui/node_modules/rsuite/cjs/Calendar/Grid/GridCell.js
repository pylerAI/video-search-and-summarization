'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _partial = _interopRequireDefault(require("lodash/partial"));
var _utils = require("../../internals/utils");
var _plainDate = require("../../internals/utils/date/plainDate");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
var _utils2 = require("../utils");
const GridCell = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    classPrefix = 'calendar-table',
    disabled,
    selected,
    date,
    onSelect,
    unSameMonth,
    rangeStart,
    rangeEnd,
    inRange,
    ...rest
  } = props;
  const jsDate = new Date(date.year, date.month - 1, date.day);
  const {
    onMouseMove,
    cellClassName,
    renderCell,
    renderCellOnPicker,
    locale: overrideLocale
  } = (0, _hooks2.useCalendar)();
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    getLocale,
    formatDate
  } = (0, _hooks.useCustom)();
  const {
    formattedDayPattern,
    today
  } = getLocale('Calendar', overrideLocale);
  const formatStr = formattedDayPattern;
  const ariaLabel = (0, _utils2.getAriaLabel)(jsDate, formatStr, formatDate);
  const isToday = (0, _plainDate.isSameDay)(date, new Date());
  const classes = merge(prefix('cell', {
    'cell-un-same-month': unSameMonth,
    'cell-is-today': isToday,
    'cell-selected': selected,
    'cell-selected-start': rangeStart,
    'cell-selected-end': rangeEnd,
    'cell-in-range': !unSameMonth && inRange,
    'cell-disabled': disabled
  }), cellClassName === null || cellClassName === void 0 ? void 0 : cellClassName(date));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    role: "gridcell",
    "aria-label": ariaLabel,
    "aria-selected": selected || undefined,
    "aria-disabled": disabled || undefined,
    tabIndex: selected ? 0 : -1,
    title: isToday ? `${ariaLabel} (${today})` : ariaLabel,
    className: classes,
    onMouseEnter: !disabled && onMouseMove ? onMouseMove.bind(null, date) : undefined,
    onClick: onSelect ? (0, _partial.default)(onSelect, date, disabled) : undefined
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('cell-content')
  }, renderCellOnPicker ? renderCellOnPicker(date) : /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('cell-day')
  }, date.day), renderCell === null || renderCell === void 0 ? void 0 : renderCell(date)));
});
GridCell.displayName = 'CalendarGridCell';
var _default = exports.default = GridCell;