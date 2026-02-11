'use client';
"use strict";

exports.__esModule = true;
exports.getColumnsAndPaths = getColumnsAndPaths;
/**
 * Calculate columns to be displayed:
 *
 * - Every ancestor level of activeItem should be displayed
 * - The level that activeItem is at should be displayed
 * - If activeItem is a parent node, its child level should be displayed
 *
 * @param items
 * @param value
 * @param options
 * @returns
 */
function getColumnsAndPaths(items, pathTarget, options) {
  const {
    getParent,
    getChildren
  } = options;
  if (!pathTarget) {
    return {
      columns: [items],
      path: []
    };
  }
  const columns = [];
  const path = [pathTarget];
  const children = getChildren(pathTarget);
  if (children && children.length > 0) {
    columns.unshift(children);
  }
  for (let parent = getParent(pathTarget); parent; parent = getParent(parent)) {
    var _getChildren;
    columns.unshift((_getChildren = getChildren(parent)) !== null && _getChildren !== void 0 ? _getChildren : []);
    path.unshift(parent);
  }
  columns.unshift(items);
  return {
    columns,
    path
  };
}