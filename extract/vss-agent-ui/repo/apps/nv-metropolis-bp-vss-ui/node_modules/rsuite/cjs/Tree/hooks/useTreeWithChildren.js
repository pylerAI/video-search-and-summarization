'use client';
"use strict";

exports.__esModule = true;
exports.default = useTreeWithChildren;
var _react = require("react");
var _utils = require("../../internals/utils");
var _utils2 = require("../../internals/Tree/utils");
/**
 * Custom hook that provides functionality for managing a tree structure with children.
 */
function useTreeWithChildren(data, options) {
  const {
    valueKey,
    childrenKey
  } = options;
  const [loadingNodeValues, setLoadingNodeValues] = (0, _react.useState)([]);
  const [treeData, setTreeData] = (0, _react.useState)(data);
  (0, _react.useEffect)(() => {
    setTreeData(data);
  }, [data]);
  const concatChildren = (0, _react.useCallback)((treeNode, children) => {
    const value = treeNode[valueKey];
    treeNode = (0, _utils2.findNodeOfTree)(data, item => value === item[valueKey]);
    treeNode[childrenKey] = children;
    const newData = data.concat([]);
    setTreeData(newData);
    return newData;
  }, [data, valueKey, childrenKey]);
  const appendChild = (0, _react.useCallback)((node, getChildren) => {
    setLoadingNodeValues(prev => prev.concat(node[valueKey]));
    const children = getChildren(node);
    if (children instanceof Promise) {
      children.then(res => {
        const newData = concatChildren(node, res);
        setTreeData(newData);
        setLoadingNodeValues(prev => prev.filter(item => !(0, _utils.shallowEqual)(item, node[valueKey])));
      });
    } else {
      setTreeData(concatChildren(node, children));
      setLoadingNodeValues(prev => prev.filter(item => !(0, _utils.shallowEqual)(item, node[valueKey])));
    }
  }, [concatChildren, valueKey]);
  return {
    treeData,
    loadingNodeValues,
    appendChild
  };
}