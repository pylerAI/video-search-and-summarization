'use client';
"use strict";

exports.__esModule = true;
exports.getResponsiveClasses = void 0;
var _constants = require("../../constants");
/**
 * Generates responsive CSS class names based on the provided value and prefix function.
 * Handles both static and responsive values.
 *
 * @example
 * // With a single value
 * // getResponsiveClasses('rs-row', 'top');
 * // Returns: ['rs-row-top']
 *
 * @example
 * // With responsive values
 * // getResponsiveClasses('rs-row', { xs: 'top', md: 'bottom' });
 * // Returns: ['rs-row-xs-top', 'rs-row-md-bottom']
 *
 */
const getResponsiveClasses = (prefix, value) => {
  if (!value) {
    return [];
  }

  // Handle non-object (static) values
  if (typeof value !== 'object') {
    return [prefix(value)];
  }

  // Process responsive values for each breakpoint
  return _constants.BREAKPOINTS.reduce((classes, breakpoint) => {
    const breakpointValue = value[breakpoint];
    if (!breakpointValue) return classes;
    return [...classes, prefix(`${breakpoint}-${breakpointValue}`)];
  }, []);
};
exports.getResponsiveClasses = getResponsiveClasses;