'use client';
"use strict";

exports.__esModule = true;
exports.isPresetColor = exports.getLuminance = exports.getContrastText = exports.getColorValue = exports.getColorStyle = exports.expandHexColor = exports.createColorVariables = void 0;
var _colours = require("../types/colours");
var _styleSheet = require("./style-sheet");
/**
 * Checks if a color value matches the pattern like 'red', 'gray.50', etc.,
 * and returns the appropriate CSS variable format.
 * @param color The color value to check
 * @returns The CSS variable if it's a valid color type, or the original value
 */
const getColorValue = color => {
  if (!color) return undefined;

  // Check if color is a base color (e.g., 'red', 'blue')
  const baseColorRegex = /^(red|orange|yellow|green|cyan|blue|violet|gray)$/;
  if (baseColorRegex.test(color)) {
    return `var(--rs-color-${color})`;
  }

  // Check if color is a color with shade (e.g., 'red.50', 'gray.900')
  const colorWithShadeRegex = /^(red|orange|yellow|green|cyan|blue|violet|gray)\.([1-9]00|50)$/;
  const match = color === null || color === void 0 ? void 0 : color.match(colorWithShadeRegex);
  if (match) {
    const [, colorName, shade] = match;
    return `var(--rs-${colorName}-${shade})`;
  }

  // Return the original value if it's not a recognized color pattern
  return color;
};
exports.getColorValue = getColorValue;
const isPresetColor = color => {
  if (!color) {
    return false;
  }
  if (color === 'default') {
    return true;
  }
  return Object.values(_colours.Colours).includes(color);
};
exports.isPresetColor = isPresetColor;
const colorConfig = {
  prop: 'color',
  useGlobalVar: true,
  presetChecker: isPresetColor,
  valueTransformer: getColorValue
};
const getColorStyle = exports.getColorStyle = (0, _styleSheet.createStyleGetter)(colorConfig);

/**
 * Convert short hex color to full hex color
 * e.g. #fff -> #ffffff
 */
const expandHexColor = color => {
  const hex = color.toLowerCase().replace('#', '');
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }
  return `#${hex}`;
};

/**
 * Calculate relative luminance of a color
 * Using the formula from WCAG 2.0
 */
exports.expandHexColor = expandHexColor;
const getLuminance = color => {
  // Convert hex to rgb
  const fullHex = expandHexColor(color);
  const hex = fullHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Convert rgb to relative luminance
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Get contrasting text color (black or white) based on background color
 */
exports.getLuminance = getLuminance;
const getContrastText = bgColor => {
  // For non-hex colors, return default dark text
  if (!bgColor.startsWith('#')) {
    return 'var(--rs-text-primary)';
  }
  const luminance = getLuminance(bgColor);
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

/**
 * Create CSS color variables for custom colors
 * Returns background and optional text color variables
 */
exports.getContrastText = getContrastText;
const createColorVariables = (color, bgFieldName = '--rs-color-bg', textFieldName) => {
  if (color && !isPresetColor(color)) {
    const colorStr = color.toString();
    // Only convert to hex if it's a hex color
    const bgColor = colorStr.startsWith('#') ? expandHexColor(colorStr) : colorStr;
    const styles = {
      [bgFieldName]: bgColor
    };
    if (textFieldName) {
      styles[textFieldName] = getContrastText(bgColor);
    }
    return styles;
  }
  return undefined;
};
exports.createColorVariables = createColorVariables;