'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.usePaths = usePaths;
var _react = require("react");
var _utils = require("../../internals/Tree/utils");
var _utils2 = require("../utils");
/**
 * A Hook to get the selected path of Tree.
 *
 * - The columns of items to be displayed
 * - The path towards the current focused item
 * - The path towards the current selected item (referred to by Cascader's value)
 *
 */
function usePaths({
  data,
  activeItem,
  selectedItem,
  getParent,
  getChildren
}) {
  const pathTowardsSelectedItem = (0, _react.useMemo)(() => (0, _utils.getPathTowardsItem)(selectedItem, getParent), [getParent, selectedItem]);
  const {
    columns,
    path: pathTowardsActiveItem
  } = (0, _react.useMemo)(() => (0, _utils2.getColumnsAndPaths)(data, activeItem, {
    getParent,
    getChildren
  }), [data, activeItem, getParent, getChildren]);
  return {
    columns,
    pathTowardsSelectedItem,
    pathTowardsActiveItem
  };
}
var _default = exports.default = usePaths;