'use client';
"use strict";

exports.__esModule = true;
exports.UNSAFE_flattenTree = UNSAFE_flattenTree;
exports.WalkTreeStrategy = void 0;
exports.flattenTree = flattenTree;
exports.walkTreeBfs = walkTreeBfs;
exports.walkTreeDfs = walkTreeDfs;
var _utils = require("../../internals/utils");
/**
 * Strategy for walking the tree.
 */
let WalkTreeStrategy = exports.WalkTreeStrategy = /*#__PURE__*/function (WalkTreeStrategy) {
  WalkTreeStrategy[WalkTreeStrategy["DFS"] = 0] = "DFS";
  WalkTreeStrategy[WalkTreeStrategy["BFS"] = 1] = "BFS";
  return WalkTreeStrategy;
}({});
/**
 * Flattens a tree structure into an array.
 */
function flattenTree(rootNodes, getChildren, walkStrategy = WalkTreeStrategy.BFS) {
  const result = [];
  if (walkStrategy === WalkTreeStrategy.BFS) {
    walkTreeBfs(rootNodes, getChildren, node => result.push(node));
  } else if (walkStrategy === WalkTreeStrategy.DFS) {
    walkTreeDfs(rootNodes, getChildren, node => result.push(node));
  }
  return result;
}

/**
 * Walks the tree in a breadth-first search (BFS) manner.
 */
function walkTreeBfs(rootNodes, getChildren, callback) {
  for (const queue = [...rootNodes]; queue.length > 0;) {
    const node = queue.shift();
    callback(node);
    const children = getChildren(node);
    if (children) {
      queue.push(...children);
    }
  }
}

/**
 * Walks the tree in a depth-first search (DFS) manner.
 */
function walkTreeDfs(rootNodes, getChildren, callback) {
  for (const node of rootNodes) {
    callback(node);
    const children = getChildren(node);
    if (children) {
      walkTreeDfs(children, getChildren, callback);
    }
  }
}

/**
 * Flattens a tree structure to an array (deprecated).
 * @deprecated This function is considered unsafe because it mutates the `tree` argument in-place.
 *             Use the `flattenTree` function instead.
 */
function UNSAFE_flattenTree(tree, childrenKey = 'children', executor) {
  const flattenData = [];
  const traverse = (data, parent) => {
    if (!Array.isArray(data)) {
      return;
    }
    data.forEach((item, index) => {
      const node = typeof executor === 'function' ? executor(item, index) : item;
      flattenData.push((0, _utils.attachParent)(node, parent));
      if (item[childrenKey]) {
        traverse(item[childrenKey], item);
      }
    });
  };
  traverse(tree, null);
  return flattenData;
}