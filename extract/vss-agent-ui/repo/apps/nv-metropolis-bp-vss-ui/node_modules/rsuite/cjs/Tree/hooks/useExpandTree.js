'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.getDefaultExpandItemValues = getDefaultExpandItemValues;
var _react = require("react");
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _hooks = require("../../internals/hooks");
var _Picker = require("../../internals/Picker");
var _utils = require("../utils");
function getDefaultExpandItemValues(data, options) {
  const {
    valueKey,
    defaultExpandAll,
    childrenKey,
    defaultExpandItemValues = []
  } = options;
  if (defaultExpandAll) {
    return (0, _utils.flattenTree)(data, item => item[childrenKey] || []).filter(item => Array.isArray(item[childrenKey]) && item[childrenKey].length > 0).map(item => item[valueKey]);
  }
  return defaultExpandItemValues;
}
/**
 * Custom hook for managing tree expansion state.
 */
function useExpandTree(data, props) {
  const {
    defaultExpandAll,
    valueKey,
    childrenKey,
    defaultExpandItemValues,
    controlledExpandItemValues,
    onExpand,
    getChildren,
    appendChild
  } = props;
  const [expandItemValues, setExpandItemValues] = (0, _hooks.useControlled)(controlledExpandItemValues, getDefaultExpandItemValues(data, {
    defaultExpandAll,
    valueKey,
    childrenKey,
    defaultExpandItemValues
  }));
  (0, _react.useEffect)(() => {
    if (Array.isArray(controlledExpandItemValues)) {
      setExpandItemValues(controlledExpandItemValues);
    }
  }, [controlledExpandItemValues, setExpandItemValues]);
  const handleExpandTreeNode = (0, _hooks.useEventCallback)((node, expanded) => {
    const nextExpandItemValues = (0, _utils.getExpandItemValues)({
      node,
      isExpand: !expanded,
      expandItemValues,
      valueKey
    });
    setExpandItemValues(nextExpandItemValues);
    onExpand === null || onExpand === void 0 || onExpand(nextExpandItemValues, node, (0, _Picker.createConcatChildrenFunction)(node, node[valueKey], {
      valueKey,
      childrenKey
    }));
    if ((0, _isFunction.default)(getChildren) && !node.expand && Array.isArray(node[childrenKey]) && node[childrenKey].length === 0) {
      appendChild(node, getChildren);
    }
  });
  return {
    expandItemValues,
    handleExpandTreeNode
  };
}
var _default = exports.default = useExpandTree;