'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.mergeRefs = mergeRefs;
const toFnRef = ref => !ref || typeof ref === 'function' ? ref : value => {
  ref.current = value;
};

/**
 * Merges two React refs into a single ref callback.
 */
function mergeRefs(refA, refB) {
  const a = toFnRef(refA);
  const b = toFnRef(refB);
  return value => {
    if (typeof a === 'function') a(value);
    if (typeof b === 'function') b(value);
  };
}
var _default = exports.default = mergeRefs;