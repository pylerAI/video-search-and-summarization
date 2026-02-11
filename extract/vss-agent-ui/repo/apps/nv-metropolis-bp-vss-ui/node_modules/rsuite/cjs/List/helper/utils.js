'use client';
"use strict";

exports.__esModule = true;
exports.closestNode = closestNode;
exports.getEdgeOffset = getEdgeOffset;
exports.getScrollingParent = getScrollingParent;
exports.isContainInteractiveElement = isContainInteractiveElement;
exports.setInlineStyles = setInlineStyles;
exports.setTransitionDuration = setTransitionDuration;
exports.setTranslate3d = setTranslate3d;
/**
 * interactive elements should be skiped
 * */
const INTERACTIVE_ELEMENTS = ['A', 'BUTTON', 'INPUT', 'OPTION', 'TEXTAREA', 'SELECT'];
function isContainInteractiveElement(targetNode) {
  return INTERACTIVE_ELEMENTS.includes(targetNode.tagName) || targetNode.contentEditable === 'true';
}
function setInlineStyles(node, styles) {
  if (node !== null && styles !== null) {
    for (const [key, value] of Object.entries(styles)) {
      node.style[key] = value;
    }
  }
}
function setTranslate3d(node, translate) {
  setInlineStyles(node, {
    transform: translate ? `translate3d(${translate.x}px,${translate.y}px,0)` : ''
  });
}
function setTransitionDuration(node, duration) {
  setInlineStyles(node, {
    transitionDuration: duration ? `${duration}ms` : ''
  });
}

/**
 * find closest target node from source node
 * */
function closestNode(sourceNode, judge) {
  let currentNode = sourceNode;
  while (currentNode) {
    if (judge(currentNode)) {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }
  return null;
}
function getEdgeOffset(node, parent, offset = {
  left: 0,
  top: 0
}) {
  if (!node || !parent) {
    return {};
  }

  // Get the actual offsetTop / offsetLeft value, no matter how deep the node is nested
  const nodeOffset = {
    left: (offset.left || 0) + node.offsetLeft,
    top: (offset.top || 0) + node.offsetTop
  };
  if (node.parentNode === parent) {
    return nodeOffset;
  }
  return getEdgeOffset(node.parentNode, parent, nodeOffset);
}
function getScrollingParent(el) {
  if (!el || typeof window === 'undefined' || !window.getComputedStyle) {
    return null;
  }
  try {
    return closestNode(el, el => {
      const computedStyle = window.getComputedStyle(el);
      const overflowRegex = /(auto|scroll)/;
      const properties = ['overflow', 'overflowX', 'overflowY'];
      return properties.some(property => overflowRegex.test(computedStyle[property]));
    });
  } catch {
    // In test environments, errors may occur, so return null
    return null;
  }
}