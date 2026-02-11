'use client';
"use strict";

exports.__esModule = true;
exports.getFocusableItems = exports.getActiveItem = exports.focusTreeNode = exports.focusPreviousItem = exports.focusNextItem = exports.focusLastItem = exports.focusFirstItem = exports.focusCurrentItem = void 0;
exports.scrollToActiveTreeNode = scrollToActiveTreeNode;
var _utils = require("../../internals/utils");
// Active tree node selector
const SELECTED_TREEITEM_SELECTOR = '[role="treeitem"][aria-selected="true"]';

/**
 * Retrieves the focusable items from the filtered data based on the provided props.
 * Excludes nodes that are not visible or are disabled.
 */
const getFocusableItems = (filteredData, props, isSearching) => {
  const {
    disabledItemValues,
    valueKey,
    childrenKey,
    expandItemValues
  } = props;
  const items = [];
  const loop = nodes => {
    nodes.forEach(node => {
      const disabled = disabledItemValues.some(disabledItem => (0, _utils.shallowEqual)(disabledItem, node[valueKey]));
      if (!disabled && node.visible) {
        items.push(node);
      }
      // always expand when searching
      const expand = isSearching ? true : expandItemValues.includes(node[valueKey]);
      if (node[childrenKey] && expand) {
        loop(node[childrenKey]);
      }
    });
  };
  loop(filteredData);
  return items;
};

/**
 * Returns the index of the active item in the focusItems array.
 *
 */
exports.getFocusableItems = getFocusableItems;
const getActiveIndex = (focusItemValue, focusItems, valueKey) => {
  let activeIndex = -1;
  focusItems.forEach((item, index) => {
    if ((0, _utils.shallowEqual)(item[valueKey], focusItemValue)) {
      activeIndex = index;
    }
  });
  return activeIndex;
};

/**
 * Retrieves the active item from the flattened nodes based on the provided focus item value.
 */
const getActiveItem = (focusItemValue, flattenedNodes, valueKey) => {
  let nodeData = null;
  const activeNode = Object.values(flattenedNodes).find(node => (0, _utils.shallowEqual)(node[valueKey], focusItemValue));
  if (activeNode) {
    nodeData = activeNode;
  }
  return nodeData;
};

/**
 * Focuses on a specific tree node element.
 *
 */
exports.getActiveItem = getActiveItem;
const focusTreeNode = (refKey, treeNodeRefs) => {
  var _treeItem$focus;
  const treeItem = treeNodeRefs[refKey];
  treeItem === null || treeItem === void 0 || (_treeItem$focus = treeItem.focus) === null || _treeItem$focus === void 0 || _treeItem$focus.call(treeItem);
};
exports.focusTreeNode = focusTreeNode;
/**
 * Focuses on the next item in a tree.
 */
const focusNextItem = props => {
  const {
    focusItemValue,
    focusableItems,
    treeNodesRefs,
    valueKey
  } = props;
  const activeIndex = getActiveIndex(focusItemValue, focusableItems, valueKey);
  if (focusableItems.length === 0) {
    return;
  }
  const nextIndex = activeIndex === focusableItems.length - 1 ? 0 : activeIndex + 1;
  const value = focusableItems[nextIndex][valueKey];
  focusTreeNode(focusableItems[nextIndex].refKey, treeNodesRefs);
  return value;
};

/**
 * Focuses on the previous item in a tree.
 */
exports.focusNextItem = focusNextItem;
const focusPreviousItem = props => {
  const {
    focusItemValue,
    focusableItems,
    treeNodesRefs,
    valueKey
  } = props;
  const activeIndex = getActiveIndex(focusItemValue, focusableItems, valueKey);
  if (focusableItems.length === 0) {
    return;
  }
  let prevIndex = activeIndex === 0 ? focusableItems.length - 1 : activeIndex - 1;
  prevIndex = prevIndex >= 0 ? prevIndex : 0;
  const value = focusableItems[prevIndex][valueKey];
  focusTreeNode(focusableItems[prevIndex].refKey, treeNodesRefs);
  return value;
};

/**
 * Focuses on the first item in a tree.
 */
exports.focusPreviousItem = focusPreviousItem;
const focusFirstItem = props => {
  const {
    focusableItems,
    treeNodesRefs,
    valueKey
  } = props;
  if (focusableItems.length === 0) {
    return;
  }
  const firstItem = focusableItems[0];
  const value = firstItem[valueKey];
  focusTreeNode(firstItem.refKey, treeNodesRefs);
  return value;
};

/**
 * Focuses on the last item in a tree.
 */
exports.focusFirstItem = focusFirstItem;
const focusLastItem = props => {
  const {
    focusableItems,
    treeNodesRefs,
    valueKey
  } = props;
  if (focusableItems.length === 0) {
    return;
  }
  const lastItem = focusableItems[focusableItems.length - 1];
  const value = lastItem[valueKey];
  focusTreeNode(lastItem.refKey, treeNodesRefs);
  return value;
};

/**
 * Returns the index of the first visible node in the tree that matches the given value.
 */
exports.focusLastItem = focusLastItem;
const getScrollToIndex = (nodes, value, valueKey) => {
  return nodes.filter(n => n.visible).findIndex(item => item[valueKey] === value);
};
/**
 * Scrolls the list to the active tree node.
 *
 * @param props - The props object containing the necessary parameters.
 */
function scrollToActiveTreeNode(props) {
  const {
    list,
    value,
    valueKey,
    virtualized,
    formattedNodes
  } = props;
  if (virtualized && value) {
    var _list$scrollToItem;
    const scrollIndex = getScrollToIndex(formattedNodes, value, valueKey);
    list === null || list === void 0 || (_list$scrollToItem = list.scrollToItem) === null || _list$scrollToItem === void 0 || _list$scrollToItem.call(list, scrollIndex);
  }
}
const focusCurrentItem = props => {
  const {
    selector = SELECTED_TREEITEM_SELECTOR,
    container
  } = props;
  const activeItem = container === null || container === void 0 ? void 0 : container.querySelector(selector);
  if (activeItem) {
    var _activeItem$focus, _activeItem$dataset;
    activeItem === null || activeItem === void 0 || (_activeItem$focus = activeItem.focus) === null || _activeItem$focus === void 0 || _activeItem$focus.call(activeItem);
    return (_activeItem$dataset = activeItem.dataset) === null || _activeItem$dataset === void 0 ? void 0 : _activeItem$dataset.key;
  }
};
exports.focusCurrentItem = focusCurrentItem;