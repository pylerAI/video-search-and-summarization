'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _slice = _interopRequireDefault(require("lodash/slice"));
var _utils = require("../../Tree/utils");
/**
 * A hook for column data
 * @param flattenData
 */
function useColumnData(flattenData) {
  // The columns displayed in the cascading panel.
  const [columnData, setColumnData] = (0, _react.useState)([flattenData.filter(item => !item.parent)]);

  /**
   * Add a list of options to the cascading panel. Used for lazy loading options.
   * @param column
   * @param index The index of the current column.
   */
  function addColumn(column, index) {
    setColumnData([...(0, _slice.default)(columnData, 0, index), column]);
  }

  /**
   * Remove subsequent columns of the specified column
   * @param index
   */
  function removeColumnByIndex(index) {
    setColumnData([...(0, _slice.default)(columnData, 0, index)]);
  }
  function enforceUpdateColumnData(nextData) {
    const nextFlattenData = (0, _utils.UNSAFE_flattenTree)(nextData);
    setColumnData([nextFlattenData.filter(item => !item.parent)]);
  }
  return {
    columnData,
    addColumn,
    removeColumnByIndex,
    setColumnData,
    enforceUpdateColumnData
  };
}
var _default = exports.default = useColumnData;