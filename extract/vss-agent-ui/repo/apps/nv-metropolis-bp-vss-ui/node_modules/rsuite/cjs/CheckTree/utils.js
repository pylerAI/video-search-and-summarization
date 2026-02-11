'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getCheckTreeDefaultValue = getCheckTreeDefaultValue;
exports.getDisabledState = getDisabledState;
exports.getFormattedTree = getFormattedTree;
exports.getNodeCheckState = getNodeCheckState;
exports.getSelectedItems = getSelectedItems;
exports.hasGrandchild = hasGrandchild;
exports.isAllSiblingNodeUncheckable = isAllSiblingNodeUncheckable;
exports.isEveryChildChecked = isEveryChildChecked;
exports.isEveryFirstLevelNodeUncheckable = isEveryFirstLevelNodeUncheckable;
exports.isNodeUncheckable = isNodeUncheckable;
exports.isSomeChildChecked = isSomeChildChecked;
var _isUndefined2 = _interopRequireDefault(require("lodash/isUndefined"));
var _isNil2 = _interopRequireDefault(require("lodash/isNil"));
var _constants = require("../internals/constants");
var _utils = require("../internals/utils");
var _utils2 = require("../Tree/utils");
/**
 * Retrieves the children of a given parent node from a flattened node map.
 * Filters out uncheckable children.
 * Note: Does NOT filter disabled children - disabled children are still considered in check state calculations
 */
function getChildrenByFlattenNodes(nodes, parent) {
  if (!(0, _isNil2.default)(parent.refKey) && (0, _isNil2.default)(nodes[parent.refKey])) {
    return [];
  }
  return Object.values(nodes).filter(item => {
    var _item$parent;
    return (item === null || item === void 0 || (_item$parent = item.parent) === null || _item$parent === void 0 ? void 0 : _item$parent.refKey) === parent.refKey && item.refKey && !nodes[item.refKey].uncheckable;
  });
}

/**
 * Checks if every child of a given parent node is checked.
 * Disabled children are ignored in this check.
 */
function isEveryChildChecked(parent, options) {
  const {
    nodes,
    childrenKey,
    disabledItemValues = [],
    valueKey = 'value'
  } = options;
  if ((0, _isNil2.default)(parent.refKey) || (0, _isNil2.default)(nodes[parent.refKey])) {
    return false;
  }
  const children = getChildrenByFlattenNodes(nodes, parent);
  if (!children.length) {
    var _nodes$parent$refKey$;
    return (_nodes$parent$refKey$ = nodes[parent.refKey].check) !== null && _nodes$parent$refKey$ !== void 0 ? _nodes$parent$refKey$ : false;
  }

  // Filter out disabled children
  const enabledChildren = children.filter(child => {
    const isDisabled = getDisabledState(nodes, child, {
      disabledItemValues,
      valueKey
    });
    return !isDisabled;
  });

  // If all children are disabled, return the parent's own check state
  if (enabledChildren.length === 0) {
    var _nodes$parent$refKey$2;
    return (_nodes$parent$refKey$2 = nodes[parent.refKey].check) !== null && _nodes$parent$refKey$2 !== void 0 ? _nodes$parent$refKey$2 : false;
  }

  // Check if all enabled children are checked
  return enabledChildren.every(child => {
    var _child$childrenKey;
    if ((child === null || child === void 0 || (_child$childrenKey = child[childrenKey]) === null || _child$childrenKey === void 0 ? void 0 : _child$childrenKey.length) > 0) {
      // fix: #3559
      return isEveryChildChecked(child, {
        nodes,
        childrenKey,
        disabledItemValues,
        valueKey
      });
    }
    return !(0, _isNil2.default)(child.refKey) && nodes[child.refKey].check;
  });
}

/**
 * Checks if any child node is checked.
 * Disabled children are ignored in this check.
 */
function isSomeChildChecked(nodes, parent, childrenKey, disabledItemValues = [], valueKey = 'value') {
  if (!(0, _isNil2.default)(parent.refKey) && (0, _isNil2.default)(nodes[parent.refKey])) {
    return false;
  }
  const children = getChildrenByFlattenNodes(nodes, parent);
  return children.some(child => {
    var _child$childrenKey2;
    // Skip disabled children
    const isDisabled = getDisabledState(nodes, child, {
      disabledItemValues,
      valueKey
    });
    if (isDisabled) {
      return false; // Disabled children don't count as "some checked"
    }
    if ((child === null || child === void 0 || (_child$childrenKey2 = child[childrenKey]) === null || _child$childrenKey2 === void 0 ? void 0 : _child$childrenKey2.length) > 0) {
      return isSomeChildChecked(nodes, child, childrenKey, disabledItemValues, valueKey);
    }
    return !(0, _isNil2.default)(child.refKey) && nodes[child.refKey].check;
  });
}

/**
 * Checks if any node in the data has a grandchild.
 */
function hasGrandchild(data, childrenKey) {
  return data.some(node => Array.isArray(node[childrenKey]));
}

/**
 * Checks if all sibling nodes of a given node are uncheckable.
 */
function isAllSiblingNodeUncheckable(node, nodes, uncheckableItemValues, valueKey) {
  const list = [];
  const parentNodeRefKey = node.parent ? node.parent.refKey : '';
  Object.keys(nodes).forEach(refKey => {
    var _curNode$parent;
    const curNode = nodes[refKey];
    if ((0, _isNil2.default)(node.parent) && (0, _isNil2.default)(curNode.parent)) {
      list.push(curNode);
    } else if (((_curNode$parent = curNode.parent) === null || _curNode$parent === void 0 ? void 0 : _curNode$parent.refKey) === parentNodeRefKey) {
      list.push(curNode);
    }
  });
  return list.every(node => isNodeUncheckable(node, {
    uncheckableItemValues,
    valueKey
  }));
}

/**
 * Checks if every first-level node is uncheckable based on the provided criteria.
 */
function isEveryFirstLevelNodeUncheckable(nodes, uncheckableItemValues, valueKey) {
  const list = [];
  Object.keys(nodes).forEach(refKey => {
    const curNode = nodes[refKey];
    if (!curNode.parent) {
      list.push(curNode);
    }
  });
  return list.every(node => isNodeUncheckable(node, {
    uncheckableItemValues,
    valueKey
  }));
}

/**
 * Checks if a node is uncheckable.
 */
function isNodeUncheckable(node, props) {
  const {
    uncheckableItemValues = [],
    valueKey
  } = props;
  return uncheckableItemValues.some(value => node[valueKey] === value);
}
function getFormattedTree(nodes, data, props) {
  const {
    childrenKey,
    cascade,
    disabledItemValues,
    valueKey
  } = props;
  return data.map(node => {
    const formatted = {
      ...node
    };
    const curNode = nodes[node.refKey];
    if (curNode) {
      var _node$childrenKey;
      const checkState = !(0, _isUndefined2.default)(cascade) ? getNodeCheckState(curNode, {
        cascade,
        nodes,
        childrenKey,
        disabledItemValues,
        valueKey
      }) : undefined;
      formatted.check = curNode.check;
      formatted.uncheckable = curNode.uncheckable;
      (0, _utils.attachParent)(formatted, curNode.parent);
      formatted.checkState = checkState;
      if (((_node$childrenKey = node[childrenKey]) === null || _node$childrenKey === void 0 ? void 0 : _node$childrenKey.length) > 0) {
        formatted[childrenKey] = getFormattedTree(nodes, formatted[childrenKey], props);
      }
    }
    return formatted;
  });
}

/**
 * Determines the disabled state of a tree node.
 * If a parent node is disabled, all its children should also be disabled.
 */
function getDisabledState(nodes, node, props) {
  const {
    disabledItemValues = [],
    valueKey
  } = props;
  if (!(0, _isNil2.default)(node.refKey) && (0, _isNil2.default)(nodes[node.refKey])) {
    return false;
  }

  // Check if the current node is disabled
  const isCurrentNodeDisabled = disabledItemValues.some(value => node.refKey && (0, _utils.shallowEqual)(nodes[node.refKey][valueKey], value));
  if (isCurrentNodeDisabled) {
    return true;
  }

  // Check if any parent node is disabled
  let currentNode = node;
  while (currentNode.parent) {
    const parentNode = currentNode.parent;
    const parentRefKey = parentNode.refKey;
    if (!(0, _isNil2.default)(parentRefKey) && !(0, _isNil2.default)(nodes[parentRefKey]) && disabledItemValues.some(value => (0, _utils.shallowEqual)(nodes[parentRefKey][valueKey], value))) {
      return true;
    }
    currentNode = parentNode;
  }
  return false;
}

/**
 * Returns the default value for the check tree.
 */
function getCheckTreeDefaultValue(value, uncheckableItemValues) {
  if (Array.isArray(value) && Array.isArray(uncheckableItemValues)) {
    return value.filter(v => !uncheckableItemValues.includes(v));
  }
  return value;
}

/**
 * Retrieves the selected items from the given nodes.
 */
function getSelectedItems(nodes, values) {
  const checkedItems = [];
  values.forEach(value => {
    const refKey = (0, _utils2.formatNodeRefKey)(value);
    const node = nodes[refKey];
    if (!(0, _isNil2.default)(node)) {
      checkedItems.push(node);
    }
  });
  return checkedItems;
}
/**
 * Calculates the check state of a node in a check tree.
 */
function getNodeCheckState(node, options) {
  const {
    nodes,
    cascade,
    childrenKey,
    disabledItemValues = [],
    valueKey = 'value'
  } = options;
  if (node.refKey === undefined) {
    return _constants.CHECK_STATE.UNCHECK;
  }
  if ((0, _isNil2.default)(nodes[node.refKey])) {
    return _constants.CHECK_STATE.UNCHECK;
  }
  if (!node[childrenKey] || !node[childrenKey].length || !cascade) {
    nodes[node.refKey].checkAll = false;
    return node.check ? _constants.CHECK_STATE.CHECK : _constants.CHECK_STATE.UNCHECK;
  }
  if (isEveryChildChecked(node, {
    nodes,
    childrenKey,
    disabledItemValues,
    valueKey
  })) {
    nodes[node.refKey].checkAll = true;
    nodes[node.refKey].check = true;
    return _constants.CHECK_STATE.CHECK;
  }
  if (isSomeChildChecked(nodes, node, childrenKey, disabledItemValues, valueKey)) {
    nodes[node.refKey].checkAll = false;
    return _constants.CHECK_STATE.INDETERMINATE;
  }
  return _constants.CHECK_STATE.UNCHECK;
}