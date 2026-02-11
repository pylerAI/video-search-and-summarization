'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _utils = require("../../Tree/utils");
var _utils2 = require("../../internals/utils");
/**
 * A hook to flatten tree structure data
 */
function useFlattenData(data, itemKeys) {
  const {
    childrenKey
  } = itemKeys;
  const [flattenData, setFlattenData] = (0, _react.useState)((0, _utils.UNSAFE_flattenTree)(data, itemKeys.childrenKey));
  const addFlattenData = (0, _react.useCallback)((children, parent) => {
    const nodes = children.map(child => {
      return (0, _utils2.attachParent)(child, parent);
    });
    parent[childrenKey] = nodes;
    setFlattenData([...flattenData, ...nodes]);
  }, [childrenKey, flattenData]);
  (0, _react.useEffect)(() => {
    setFlattenData((0, _utils.UNSAFE_flattenTree)(data, itemKeys.childrenKey));
  }, [data, itemKeys.childrenKey]);
  return {
    addFlattenData,
    flattenData
  };
}
var _default = exports.default = useFlattenData;