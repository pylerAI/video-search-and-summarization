'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _omit = _interopRequireDefault(require("lodash/omit"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _useForceUpdate = _interopRequireDefault(require("./useForceUpdate"));
var _react = require("react");
var _utils = require("../../internals/utils");
var _utils2 = require("../utils");
/**
 * Custom hook that flattens a tree data structure into a map of nodes.
 *
 */
function useFlattenTree(data, options) {
  const {
    value,
    labelKey,
    valueKey,
    childrenKey,
    uncheckableItemValues = [],
    disabledItemValues = [],
    cascade,
    multiple,
    callback
  } = options;
  const forceUpdate = (0, _useForceUpdate.default)();
  const flattenedNodes = (0, _react.useRef)({});
  const seenValues = (0, _react.useRef)(new Set());
  const updateTreeNodeCheckState = (0, _react.useCallback)((value = []) => {
    // Reset values to false
    Object.keys(flattenedNodes.current).forEach(refKey => {
      const node = flattenedNodes.current[refKey];

      // Check if this node or any of its parents is disabled
      const isNodeDisabled = disabledItemValues.some(disabledValue => (0, _utils.shallowEqual)(node[valueKey], disabledValue));
      let hasDisabledParent = false;
      let currentNode = node;
      while (currentNode.parent && !hasDisabledParent) {
        const parentRefKey = currentNode.parent.refKey;
        if (parentRefKey && flattenedNodes.current[parentRefKey]) {
          const parentValue = flattenedNodes.current[parentRefKey][valueKey];
          if (disabledItemValues.some(disabledValue => (0, _utils.shallowEqual)(parentValue, disabledValue))) {
            hasDisabledParent = true;
          }
        }
        currentNode = currentNode.parent;
      }

      // Skip disabled nodes - they should not be affected by cascade or value changes
      if (isNodeDisabled || hasDisabledParent) {
        return;
      }
      if (cascade && !(0, _isNil.default)(node.parent) && !(0, _isNil.default)(node.parent.refKey)) {
        node.check = flattenedNodes.current[node.parent.refKey].check;
      } else {
        node.check = false;
      }
      value.forEach(nodeVal => {
        if ((0, _utils.shallowEqual)(flattenedNodes.current[refKey][valueKey], nodeVal) && !uncheckableItemValues.some(uncheckableValue => (0, _utils.shallowEqual)(nodeVal, uncheckableValue))) {
          flattenedNodes.current[refKey].check = true;
        }
      });
    });
  }, [cascade, uncheckableItemValues, disabledItemValues, valueKey]);
  const flattenTreeData = (0, _react.useCallback)((treeData, parent, layer = 1) => {
    if (!Array.isArray(treeData) || treeData.length === 0) {
      return [];
    }
    treeData.map(node => {
      const value = node[valueKey];

      // Check for duplicate values
      if (seenValues.current.has(value)) {
        console.error(`[rsuite] The value '${value}' is duplicated. Each node in the tree data must have a unique value.`);
      }
      seenValues.current.add(value);
      const refKey = (0, _utils2.formatNodeRefKey)(value);
      node.refKey = refKey;
      flattenedNodes.current[refKey] = {
        layer,
        [labelKey]: node[labelKey],
        [valueKey]: node[valueKey],
        uncheckable: uncheckableItemValues.some(value => (0, _utils.shallowEqual)(node[valueKey], value)),
        ...node
      };
      if (parent) {
        flattenedNodes.current[refKey].parent = (0, _omit.default)(parent, 'parent', 'children');
      }
      flattenTreeData(node[childrenKey], node, layer + 1);
    });
    callback === null || callback === void 0 || callback(flattenedNodes.current);
    forceUpdate();
  }, [callback, forceUpdate, valueKey, labelKey, uncheckableItemValues, childrenKey]);
  (0, _react.useEffect)(() => {
    // when data is changed, should clear the flattenedNodes, avoid duplicate keys
    flattenedNodes.current = {};
    seenValues.current.clear();
    flattenTreeData(data);
  }, [data]);
  (0, _react.useEffect)(() => {
    if (multiple) {
      updateTreeNodeCheckState(value);
      forceUpdate();
    }

    /**
     * Add a dependency on data, because when loading data asynchronously through getChildren,
     * data may change and the node status needs to be updated.
     * @see https://github.com/rsuite/rsuite/issues/3973
     */
  }, [value, data]);
  return flattenedNodes.current;
}
var _default = exports.default = useFlattenTree;