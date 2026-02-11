'use client';
"use strict";

exports.__esModule = true;
exports.getKeyParentMap = getKeyParentMap;
exports.getParentMap = getParentMap;
/**
 * Returns a WeakMap that maps each item in `items` to its parent
 * indicated by `getChildren` function
 */
function getParentMap(items, getChildren) {
  const map = new WeakMap();
  for (const queue = [...items]; queue.length > 0;) {
    const item = queue.shift();
    const children = getChildren(item);
    if (children) {
      for (const child of children) {
        map.set(child, item);
        queue.push(child);
      }
    }
  }
  return map;
}

/**
 * Returns a Map that maps each item's "key", indicated by `getKey` function,
 * to its parent indicated by `getChildren` function
 *
 * NOTICE:
 * Using this function is discouraged.
 * Use {@link getParentMap} whenever possible.
 */
function getKeyParentMap(items, getKey, getChildren) {
  const map = new Map();
  for (const queue = [...items]; queue.length > 0;) {
    const item = queue.shift();
    const children = getChildren(item);
    if (children) {
      for (const child of children) {
        map.set(getKey(child), item);
        queue.push(child);
      }
    }
  }
  return map;
}