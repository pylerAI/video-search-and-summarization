'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.filterNodesOfTree = filterNodesOfTree;
var _clone = _interopRequireDefault(require("lodash/clone"));
function filterNodesOfTree(data, check) {
  const findNodes = (nodes = []) => {
    const nextNodes = [];
    for (let i = 0; i < nodes.length; i += 1) {
      if (Array.isArray(nodes[i].children)) {
        const nextChildren = findNodes(nodes[i].children);
        if (nextChildren.length) {
          const item = (0, _clone.default)(nodes[i]);
          item.children = nextChildren;
          nextNodes.push(item);
          continue;
        }
      }
      if (check(nodes[i])) {
        nextNodes.push(nodes[i]);
      }
    }
    return nextNodes;
  };
  return findNodes(data);
}