'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.clampValue = clampValue;
exports.decimals = decimals;
exports.valueReachesMax = valueReachesMax;
exports.valueReachesMin = valueReachesMin;
var _isNil = _interopRequireDefault(require("lodash/isNil"));
/**
 * Clamp a value within min/max and handle NaN as empty string.
 */
function clampValue(value, min, max) {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (Number.isNaN(num)) {
    return '';
  }
  let result = num;
  if (typeof max !== 'undefined' && result > max) {
    result = max;
  }
  if (typeof min !== 'undefined' && result < min) {
    result = min;
  }
  return result.toString();
}
function isNumber(value) {
  return /(^-?|^\+?|^\d?)\d*\.\d+$/.test(value + '');
}
function getDecimalLength(value) {
  if (isNumber(value)) {
    return value.toString().split('.')[1].length;
  }
  return 0;
}
function decimals(...values) {
  const lengths = values.map(getDecimalLength);
  return Math.max(...lengths);
}

/**
 * Disable the upper limit of the number.
 * @param value
 * @param max
 */
function valueReachesMax(value, max) {
  if (!(0, _isNil.default)(value)) {
    return +value >= max;
  }
  return false;
}

/**
 * Disable the lower limit of the number.
 * @param value
 * @param min
 */
function valueReachesMin(value, min) {
  if (!(0, _isNil.default)(value)) {
    return +value <= min;
  }
  return false;
}