'use client';
"use strict";

exports.__esModule = true;
exports.createChainedFunction = createChainedFunction;
exports.default = void 0;
/**
 *
 * Safe chained function
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 *
 * Largely copied directly from:
 * https://github.com/react-bootstrap/react-bootstrap/blob/master/src/utils/createChainedFunction.js
 *
 * @param {function} functions to chain
 * @returns {function|undefined}
 */

function createChainedFunction(...funcs) {
  return funcs.filter(f => f !== null && typeof f !== 'undefined').reduce((acc, f) => {
    if (typeof f !== 'function') {
      throw new Error('Invalid Argument Type, must only provide functions, undefined, or null.');
    }
    if (acc === undefined) {
      return f;
    }
    return function chainedFunction(...args) {
      acc.apply(this, args);
      f.apply(this, args);
    };
  }, undefined);
}
var _default = exports.default = createChainedFunction;