'use client';
"use strict";

exports.__esModule = true;
exports.indentTreeNode = indentTreeNode;
function indentTreeNode(rtl, layer, absolute = false) {
  // layer start from 1
  const offset = layer * 26;
  if (absolute) {
    return {
      [rtl ? 'right' : 'left']: offset
    };
  }
  return {
    [rtl ? 'paddingRight' : 'paddingLeft']: offset
  };
}