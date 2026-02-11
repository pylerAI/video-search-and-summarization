'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getNodeParents = getNodeParents;
exports.removeAllChildrenValue = exports.isSomeParentChecked = exports.isSomeChildChecked = exports.getOtherItemValuesByUnselectChild = void 0;
var _remove = _interopRequireDefault(require("lodash/remove"));
/**
 * get all ancestor nodes of given node
 * @param {*} node
 */
function getNodeParents(node, parentKey = 'parent', valueKey) {
  const parents = [];
  const traverse = node => {
    if (node !== null && node !== void 0 && node[parentKey]) {
      traverse(node[parentKey]);
      if (valueKey) {
        parents.push(node[parentKey][valueKey]);
      } else {
        parents.push(node[parentKey]);
      }
    }
  };
  traverse(node);
  return parents;
}

/**
 * Check if any child nodes are selected.
 * @param node
 * @param value
 * @param itemKeys
 */
const isSomeChildChecked = (node, value, itemKeys) => {
  const {
    childrenKey,
    valueKey
  } = itemKeys;
  if (!node[childrenKey] || !value) {
    return false;
  }
  return node[childrenKey].some(child => {
    var _child$childrenKey;
    if (value.some(n => n === child[valueKey])) {
      return true;
    }
    if ((_child$childrenKey = child[childrenKey]) !== null && _child$childrenKey !== void 0 && _child$childrenKey.length) {
      return isSomeChildChecked(child, value, itemKeys);
    }
    return false;
  });
};

/**
 * Check if the parent is selected.
 * @param node
 * @param value
 * @param itemKeys
 */
exports.isSomeChildChecked = isSomeChildChecked;
const isSomeParentChecked = (node, value, itemKeys) => {
  const {
    valueKey
  } = itemKeys;
  if (!value) {
    return false;
  }
  if (value.some(n => n === node[valueKey])) {
    return true;
  }
  if (node.parent) {
    return isSomeParentChecked(node.parent, value, itemKeys);
  }
  return false;
};
exports.isSomeParentChecked = isSomeParentChecked;
const getOtherItemValuesByUnselectChild = (itemNode, value, itemKeys) => {
  const {
    valueKey,
    childrenKey
  } = itemKeys;
  const parentValues = [];
  const itemValues = [];

  // Find the parent node of the current node by value
  function findParent(item) {
    parentValues.push(item[valueKey]);
    if (value.some(v => v === item[valueKey])) {
      return item;
    }
    if (item.parent) {
      const p = findParent(item.parent);
      if (p) {
        return p;
      }
    }
    return null;
  }

  // Get child nodes through parent node
  function pushChildValue(item) {
    if (!item[childrenKey]) {
      return;
    }
    item[childrenKey].forEach(n => {
      // Determine whether it is a direct parent
      if (parentValues.some(v => v === n[valueKey]) && n[childrenKey]) {
        pushChildValue(n);
      } else if (n[valueKey] !== itemNode[valueKey]) {
        itemValues.push(n[valueKey]);
      }
    });
  }
  const parent = findParent(itemNode);
  if (!parent) {
    return [];
  }
  pushChildValue(parent);
  return itemValues;
};

/**
 * Remove the values of all children.
 */
exports.getOtherItemValuesByUnselectChild = getOtherItemValuesByUnselectChild;
const removeAllChildrenValue = (value, item, itemKeys) => {
  const {
    valueKey,
    childrenKey
  } = itemKeys;
  let removedValue = [];
  if (!item[childrenKey]) {
    return;
  }
  item[childrenKey].forEach(n => {
    removedValue = removedValue.concat((0, _remove.default)(value, v => v === n[valueKey]));
    if (n[childrenKey]) {
      removeAllChildrenValue(value, n, itemKeys);
    }
  });
  return removedValue;
};
exports.removeAllChildrenValue = removeAllChildrenValue;