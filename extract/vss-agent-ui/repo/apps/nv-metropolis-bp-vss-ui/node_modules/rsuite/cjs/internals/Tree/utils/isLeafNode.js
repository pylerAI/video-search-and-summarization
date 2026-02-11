'use client';
"use strict";

exports.__esModule = true;
exports.isLeafNode = isLeafNode;
/**
 * Checks if a node is a leaf node.
 * @param node  The node to check.
 * @param childrenKey The key of the children property.
 */
function isLeafNode(node, childrenKey = 'children') {
  if (!node) {
    return true;
  }
  const children = node[childrenKey];
  return !children || !Array.isArray(children) || children.length === 0;
}