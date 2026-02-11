'use client';
"use strict";

exports.__esModule = true;
exports.isPresetSize = exports.getSizeValue = exports.getSizeStyle = exports.getLineHeightStyle = void 0;
var _types = require("../types");
var _styleSheet = require("./style-sheet");
const isPresetSize = size => {
  if (!size) {
    return false;
  }
  const presetSizes = [...Object.values(_types.SizeEnum), ...Object.values(_types.TypographySizeEnum), 'full'];
  return presetSizes.includes(size);
};
exports.isPresetSize = isPresetSize;
const sizeConfig = {
  prop: 'size',
  presetChecker: isPresetSize,
  valueTransformer: _styleSheet.getCssValue
};
const getSizeValue = (type, size) => {
  if (isPresetSize(size)) {
    return `var(--rs-${type}-${size})`;
  }
  return (0, _styleSheet.getCssValue)(size);
};
exports.getSizeValue = getSizeValue;
const getSizeStyle = exports.getSizeStyle = (0, _styleSheet.createStyleGetter)(sizeConfig);
const lineHeightConfig = {
  prop: 'line-height',
  presetChecker: isPresetSize,
  valueTransformer: value => isPresetSize(value) ? value : null
};
const getLineHeightStyle = exports.getLineHeightStyle = (0, _styleSheet.createStyleGetter)(lineHeightConfig);