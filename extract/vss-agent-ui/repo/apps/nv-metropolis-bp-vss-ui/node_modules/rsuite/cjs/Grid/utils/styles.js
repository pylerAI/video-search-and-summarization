'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getResponsiveGutterStyles = void 0;
var _isPlainObject = _interopRequireDefault(require("lodash/isPlainObject"));
var _constants = require("../../internals/constants");
var _utils = require("../../internals/utils");
/**
 * Generates CSS variable styles for grid gutters, supporting both single values and arrays [horizontal, vertical]
 */
const getResponsiveGutterStyles = gutter => {
  if (typeof gutter === 'undefined') {
    return {};
  }

  // Helper function to process gutter values and generate CSS variables
  const processGutterValue = (value, prefix = '') => {
    const [h, v] = Array.isArray(value) ? value : [value, value];
    return {
      [`--rs-grid-gutter${prefix}`]: (0, _utils.getCssValue)(h),
      [`--rs-grid-row-gutter${prefix}`]: (0, _utils.getCssValue)(v)
    };
  };

  // Handle responsive object
  if ((0, _isPlainObject.default)(gutter)) {
    return _constants.BREAKPOINTS.reduce((styles, breakpoint) => {
      const value = gutter[breakpoint];
      if (!value) return styles;
      const prefix = breakpoint === 'xs' ? '' : `-${breakpoint}`;
      return (0, _utils.mergeStyles)(styles, processGutterValue(value, prefix));
    }, {});
  }

  // Handle non-responsive value
  return processGutterValue(gutter);
};
exports.getResponsiveGutterStyles = getResponsiveGutterStyles;