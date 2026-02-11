'use client';
"use strict";

exports.__esModule = true;
exports.composeFunctions = composeFunctions;
exports.default = void 0;
/**
 * Composes multiple functions into a single function.
 *
 * @example
 * ```
 * const a = () => console.log('a');
 * const b = () => console.log('b');
 * const c = () => console.log('c');
 *
 * const d = composeFunctions(a, b, c);
 *
 * d(); // a b c
 * ```
 */
function composeFunctions(...fns) {
  return first => fns.reduce((previousValue, fn) => fn(previousValue), first);
}
var _default = exports.default = composeFunctions;