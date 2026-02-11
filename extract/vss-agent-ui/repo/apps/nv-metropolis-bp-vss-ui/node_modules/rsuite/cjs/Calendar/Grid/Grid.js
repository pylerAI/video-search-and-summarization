'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _GridRow = _interopRequireDefault(require("./GridRow"));
var _GridHeaderRow = _interopRequireDefault(require("./GridHeaderRow"));
var _utils = require("../../internals/utils");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
const Grid = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-table',
    rows = [],
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const {
    targetId
  } = (0, _hooks2.useCalendar)();
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "grid",
    tabIndex: -1,
    id: targetId ? `${targetId}-${classPrefix}` : undefined
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(_GridHeaderRow.default, null), rows.map((rowStartingDate, index) => /*#__PURE__*/_react.default.createElement(_GridRow.default, {
    key: index,
    startingDate: rowStartingDate,
    rowIndex: index + 1
  })));
});
Grid.displayName = 'CalendarGrid';
var _default = exports.default = Grid;