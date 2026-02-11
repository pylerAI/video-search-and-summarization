'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.kebabPlace = kebabPlace;
exports.placementPolyfill = placementPolyfill;
var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));
/**
 * Replaces the placement string with its polyfilled counterpart based on the given RTL (Right-to-Left) value.
 * @example
 * ```
 * placementPolyfill('bottomLeft');
 * // 'bottomStart'
 * ```
 */
function placementPolyfill(placement, rtl = false) {
  if (typeof placement === 'string') {
    if (rtl) {
      placement = placement.replace(/left|right/, m => m === 'left' ? 'right' : 'left');
    }
    return placement.replace(/Left|Top/, 'Start').replace(/Right|Bottom/, 'End');
  }
  return placement;
}

/**
 * Converts a placement string to kebab-case and applies RTL polyfill if needed.
 * @example
 * ```
 * kebabPlace('bottomLeft');
 * // 'bottom-start'
 *
 * kebabPlace('topRight', true);
 * // 'top-start'
 * ```
 */
function kebabPlace(placement, rtl) {
  if (typeof placement === 'string') {
    return (0, _kebabCase.default)(placementPolyfill(placement, rtl));
  }
  return placement;
}