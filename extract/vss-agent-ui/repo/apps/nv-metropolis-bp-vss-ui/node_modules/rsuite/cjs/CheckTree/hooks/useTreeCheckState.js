'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _cloneDeep = _interopRequireDefault(require("lodash/cloneDeep"));
var _hooks = require("../../internals/hooks");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
var _utils = require("../utils");
function useTreeCheckState(props) {
  const {
    cascade,
    flattenedNodes,
    uncheckableItemValues,
    disabledItemValues = []
  } = props;
  const {
    valueKey,
    childrenKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const checkParentNode = (0, _hooks.useEventCallback)((nodes, node, checked) => {
    const currentNode = node.refKey ? nodes[node.refKey] : null;
    if (cascade && currentNode) {
      if (!checked) {
        currentNode.check = checked;
        currentNode.checkAll = checked;
      } else {
        if ((0, _utils.isEveryChildChecked)(currentNode, {
          nodes,
          childrenKey,
          disabledItemValues,
          valueKey
        })) {
          currentNode.check = true;
          currentNode.checkAll = true;
        } else {
          currentNode.check = false;
          currentNode.checkAll = false;
        }
      }
      if (currentNode.parent) {
        checkParentNode(nodes, currentNode.parent, checked);
      }
    }
  });

  /**
   * Recursively checks if a node has any disabled descendants.
   * This is used to determine if a parent node's checkAll state should be true.
   * If any descendant is disabled, checkAll must be false because not all descendants can be checked.
   * @param nodes - The flattened tree node map
   * @param node - The node to check for disabled descendants
   * @returns true if any descendant (at any depth) is disabled, false otherwise
   */
  const hasDisabledDescendant = (0, _hooks.useEventCallback)((nodes, node) => {
    if (!node[childrenKey] || !node[childrenKey].length) {
      return false;
    }
    return node[childrenKey].some(child => {
      const isChildDisabled = (0, _utils.getDisabledState)(nodes, child, {
        disabledItemValues,
        valueKey
      });
      if (isChildDisabled) {
        return true;
      }
      // Recursively check descendants
      return hasDisabledDescendant(nodes, child);
    });
  });
  const checkChildNode = (0, _hooks.useEventCallback)((nodes, node, isChecked) => {
    const currentNode = node.refKey ? nodes[node.refKey] : null;
    if (!currentNode) {
      return;
    }

    // Check if the current node is disabled
    const isDisabled = (0, _utils.getDisabledState)(nodes, node, {
      disabledItemValues,
      valueKey
    });

    // Skip checking disabled nodes
    if (isDisabled) {
      return;
    }
    currentNode.check = isChecked;
    if (!currentNode[childrenKey] || !currentNode[childrenKey].length || !cascade) {
      currentNode.checkAll = false;
    } else {
      // Check if any descendant (not just direct children) is disabled
      const hasDisabledDesc = hasDisabledDescendant(nodes, currentNode);

      // Only set checkAll to true if all descendants will be checked
      // If there are any disabled descendants, checkAll should be false
      currentNode.checkAll = isChecked && !hasDisabledDesc;
      currentNode[childrenKey].forEach(child => {
        checkChildNode(nodes, child, isChecked);
      });
    }
  });
  const getCheckedValuesByParent = (0, _react.useCallback)(nodes => {
    const values = [];
    for (const key in nodes) {
      const currentNode = nodes[key];
      if (!(0, _isNil.default)(currentNode.parent) && !(0, _isNil.default)(currentNode.parent.refKey)) {
        const parentNode = nodes[currentNode.parent.refKey];
        if (currentNode.check) {
          // Optimization: When a parent node is checked with checkAll=true, it represents
          // the entire checked subtree. If the current node also has checkAll=true and its
          // parent is checked, skip adding this node's value to avoid redundant representation.
          // The parent's value already implies all descendants are checked.
          if (currentNode.checkAll && parentNode.check) {
            continue;
          }
          if (!(parentNode !== null && parentNode !== void 0 && parentNode.checkAll)) {
            values.push(currentNode[valueKey]);
          } else if (parentNode !== null && parentNode !== void 0 && parentNode.uncheckable) {
            values.push(currentNode[valueKey]);
          }
        }
      } else if (currentNode.check) {
        values.push(currentNode[valueKey]);
      }
    }
    return values;
  }, [valueKey]);
  const getCheckedValues = (0, _hooks.useEventCallback)((node, isChecked) => {
    const nodes = (0, _cloneDeep.default)(flattenedNodes);
    checkChildNode(nodes, node, isChecked);
    if (node.parent) {
      checkParentNode(nodes, node.parent, isChecked);
    }
    const values = getCheckedValuesByParent(nodes);
    return values.filter(v => !uncheckableItemValues.includes(v));
  });
  return {
    getCheckedValues
  };
}
var _default = exports.default = useTreeCheckState;