'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.omitBoxProps = exports.extractBoxProps = void 0;
var _camelCase = _interopRequireDefault(require("lodash/camelCase"));
var _styledSystem = require("../styled-system");
var _utils = require("../utils");
const getUsedPropKeys = () => {
  const propSet = new Set();
  Object.entries(_styledSystem.cssSystemPropAlias).forEach(([key, prop]) => {
    const {
      property
    } = prop;
    const propName = (0, _camelCase.default)(property);
    propSet.add(key);
    propSet.add(propName);
  });
  return Array.from(propSet);
};

/**
 * Extract box properties from props
 * @param props Original props object
 * @returns Object containing only box properties
 */
const extractBoxProps = props => {
  const boxPropKeys = getUsedPropKeys();
  const boxProps = {};

  // Extract only box related properties
  Object.keys(props).forEach(key => {
    if (boxPropKeys.includes(key) && props[key] !== undefined) {
      boxProps[key] = props[key];
    } else if ((0, _utils.isCSSProperty)(key)) {
      boxProps[key] = props[key];
    }
  });
  return boxProps;
};

/**
 * Filter out layout properties from props
 * @param props Original props object
 * @returns New object without layout properties
 */
exports.extractBoxProps = extractBoxProps;
const omitBoxProps = props => {
  const boxPropKeys = getUsedPropKeys();
  const filteredProps = {};

  // Copy all properties except box related ones
  Object.keys(props).forEach(key => {
    if (!boxPropKeys.includes(key)) {
      filteredProps[key] = props[key];
    }
  });
  return filteredProps;
};
exports.omitBoxProps = omitBoxProps;