'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.createOffsetStyles = createOffsetStyles;
exports.getCssValue = getCssValue;
exports.isCSSProperty = isCSSProperty;
exports.mergeStyles = mergeStyles;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _camelCase = _interopRequireDefault(require("lodash/camelCase"));
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
/**
 * Processes and returns a value suitable for CSS (with a unit).
 */
function getCssValue(value, unit = 'px') {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  // If the value is 0, return it as a string without unit
  if (value === 0) {
    return '0';
  }

  // If the value is a number, append the default unit (defaults to 'px')
  if (typeof value === 'number') {
    return `${value}${unit}`;
  }

  // Return string values as is
  return value.toString();
}

/**
 * Merge multiple style objects, filtering out undefined values
 */
function mergeStyles(...styles) {
  const mergedStyles = styles === null || styles === void 0 ? void 0 : styles.filter(Boolean).reduce((acc, style) => {
    if (!style) return acc;
    return {
      ...acc,
      ...style
    };
  }, {});
  return (0, _isEmpty.default)(mergedStyles) ? undefined : mergedStyles;
}

/**
 * Create CSS variables for offset positioning
 */
function createOffsetStyles(offset, prefix = '--rs-offset') {
  if (!offset) return undefined;
  const [x, y] = offset;
  return {
    [`${prefix}-x`]: getCssValue(x),
    [`${prefix}-y`]: getCssValue(y)
  };
}

/**
 * Check if a string is a valid CSS property name
 * @param prop - The property name to check
 * @returns True if the property is a valid CSS property
 */
function isCSSProperty(prop) {
  if (!_canUseDOM.default || typeof prop !== 'string' || !prop) {
    return false;
  }
  try {
    // Handle standard properties
    const style = document.documentElement.style;

    // Check standard property
    if (prop in style) {
      return true;
    } else if ((0, _camelCase.default)(prop) in style) {
      return true;
    }

    // Handle vendor-prefixed properties (e.g., Webkit, Moz, ms, O)
    const prefixes = ['Webkit', 'Moz', 'ms', 'O'];
    const propName = prop.charAt(0).toUpperCase() + prop.slice(1);
    return prefixes.some(prefix => `${prefix}${propName}` in style);
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Failed to check CSS property: ${prop}`, e);
    }
    return false;
  }
}