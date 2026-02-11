'use client';
"use strict";

exports.__esModule = true;
exports.getExpandItemValues = getExpandItemValues;
/**
 * Returns an array of expanded item values.
 */
function getExpandItemValues({
  node,
  isExpand,
  expandItemValues,
  valueKey
}) {
  const newExpandItemValues = new Set(expandItemValues);
  if (isExpand) {
    newExpandItemValues.add(node[valueKey]);
  } else {
    newExpandItemValues.delete(node[valueKey]);
  }
  return Array.from(newExpandItemValues);
}