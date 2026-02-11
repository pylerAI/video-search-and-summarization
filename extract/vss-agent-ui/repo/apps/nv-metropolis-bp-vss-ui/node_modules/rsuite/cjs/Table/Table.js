'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _TableCell = _interopRequireDefault(require("./TableCell"));
var _TableHeaderCell = _interopRequireDefault(require("./TableHeaderCell"));
var _TableColumn = _interopRequireDefault(require("./TableColumn"));
var _TableColumnGroup = _interopRequireDefault(require("./TableColumnGroup"));
var _hooks = require("../internals/hooks");
var _rsuiteTable = require("rsuite-table");
const CustomTable = /*#__PURE__*/_react.default.forwardRef(function Table(props, ref) {
  const {
    propsWithDefaults,
    rtl,
    getLocale
  } = (0, _hooks.useCustom)('Table', props);
  const {
    locale: overrideLocale,
    loadAnimation = true,
    ...rest
  } = propsWithDefaults;
  const locale = getLocale('common', overrideLocale);
  return /*#__PURE__*/_react.default.createElement(_rsuiteTable.Table, (0, _extends2.default)({}, rest, {
    rtl: rtl,
    ref: ref,
    locale: locale,
    loadAnimation: loadAnimation
  }));
});

/**
 * The `Table` component is used to display data in a table.
 *
 * @see https://rsuitejs.com/components/table/
 */
const Table = Object.assign(CustomTable, {
  /**
   * The `Table.Cell` component  is used to display data in a table cell.
   */
  Cell: _TableCell.default,
  /**
   * The `Table.Column` component  is used to define a column in a table.
   */
  Column: _TableColumn.default,
  /**
   * The `Table.HeaderCell` component  is used to define a header cell in a table.
   */
  HeaderCell: _TableHeaderCell.default,
  /**
   * The `Table.ColumnGroup` component  is used to define a column group in a table.
   */
  ColumnGroup: _TableColumnGroup.default
});
var _default = exports.default = Table;