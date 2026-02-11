'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _intersection = _interopRequireDefault(require("lodash/intersection"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _getNodeParentKeys = require("../utils/getNodeParentKeys");
var _isSearching = require("../utils/isSearching");
var _flattenTree = require("../utils/flattenTree");
var _utils = require("../../CheckTree/utils");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
/**
 * Determines whether a node should be shown based on the expanded state of its parent nodes.
 */
function shouldShowNodeByParentExpanded(expandItemValues = [], parentKeys = []) {
  const intersectionKeys = (0, _intersection.default)(expandItemValues, parentKeys);
  if (intersectionKeys.length === parentKeys.length) {
    return true;
  }
  return false;
}
function useVirtualizedTreeData(nodes, data, options) {
  const {
    childrenKey,
    valueKey
  } = (0, _TreeProvider.useItemDataKeys)();

  /**
   * Formats the virtualized tree data.
   */
  return (0, _react.useCallback)(() => {
    const {
      cascade,
      searchKeyword,
      expandItemValues,
      disabledItemValues = []
    } = options;
    return (0, _flattenTree.UNSAFE_flattenTree)(data, childrenKey, node => {
      let formatted = {};
      const curNode = nodes === null || nodes === void 0 ? void 0 : nodes[node.refKey];
      const parentKeys = (0, _getNodeParentKeys.getNodeParentKeys)(nodes, curNode, valueKey);
      /**
       * When using virtualized,
       * if the parent node is collapsed, the child nodes should be hidden
       * avoid component height calculation errors
       */
      let visible = curNode !== null && curNode !== void 0 && curNode.parent ? shouldShowNodeByParentExpanded(expandItemValues, parentKeys) : true;

      /**
       * when searching, every node default expand
       * the node's visible should follow the original state
       */
      if ((0, _isSearching.isSearching)(searchKeyword)) {
        visible = node.visible;
      }
      if (curNode) {
        const checkState = !(0, _isUndefined.default)(cascade) ? (0, _utils.getNodeCheckState)(curNode, {
          cascade,
          nodes,
          childrenKey,
          disabledItemValues,
          valueKey
        }) : undefined;
        formatted = {
          ...node,
          check: curNode.check,
          uncheckable: curNode.uncheckable,
          hasChildren: !!node[childrenKey],
          layer: curNode.layer,
          parent: curNode.parent,
          checkState,
          visible
        };
      }
      return formatted;
    });
  }, [childrenKey, data, nodes, options, valueKey]);
}
var _default = exports.default = useVirtualizedTreeData;