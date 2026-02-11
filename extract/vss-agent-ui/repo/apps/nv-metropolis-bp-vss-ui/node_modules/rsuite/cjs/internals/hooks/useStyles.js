'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useStyles = useStyles;
var _classnames = _interopRequireDefault(require("classnames"));
var _react = require("react");
var _utils = require("../utils");
var _CustomContext = require("../Provider/CustomContext");
// This is the only way I found to break circular references between ClassArray and ClassValue
// https://github.com/Microsoft/TypeScript/issues/3496#issuecomment-128553540

/**
 * Add a prefix to all classNames.
 *
 * @param str prefix of className
 * @returns { withPrefix, merge, prefix }
 *  - withPrefix: A function of combining className and adding a prefix to each className.
 *    At the same time, the default `classPrefix` is the first className.
 *  - merge: A merge className function.
 *  - prefix: Add a prefix to className
 *  - rootPrefix
 */
function useStyles(str) {
  const {
    classPrefix = 'rs'
  } = (0, _react.useContext)(_CustomContext.CustomContext) || {};
  const baseClass = (0, _utils.prefix)(classPrefix, str);

  /**
   * @example
   *
   * if str = 'button':
   * prefix('red', { active: true }) => 'rs-button-red rs-button-active'
   */
  const prefix = (0, _react.useCallback)((...classes) => {
    const mergeClasses = classes.length ? (0, _classnames.default)(...classes).split(' ').map(item => (0, _utils.prefix)(baseClass, item)) : [];
    return mergeClasses.filter(cls => cls).join(' ');
  }, [baseClass]);

  /**
   * @example
   *
   * if str = 'button':
   * withPrefix('red', { active: true }) => 'rs-button rs-button-red rs-button-active'
   */
  const withPrefix = (0, _react.useCallback)((...classes) => {
    const mergeClasses = prefix(classes);
    return mergeClasses ? `${baseClass} ${mergeClasses}` : baseClass;
  }, [baseClass, prefix]);

  /**
   * @example
   * rootPrefix('btn') => 'rs-btn'
   * rootPrefix('btn', { active: true }) => 'rs-btn rs-active'
   */
  const rootPrefix = (...classes) => {
    const mergeClasses = classes.length ? (0, _classnames.default)(...classes).split(' ').map(item => (0, _utils.prefix)(classPrefix, item)) : [];
    return mergeClasses.filter(cls => cls).join(' ');
  };
  const cssVar = (0, _react.useCallback)((prop, value, valueTransformer) => {
    if (typeof value === 'undefined') {
      return;
    }
    return (0, _utils.createStyleGetter)({
      prop,
      valueTransformer
    })(value, str, prop);
  }, [str]);
  const responsive = (0, _react.useCallback)(value => {
    if (!value) return [];
    return (0, _utils.getResponsiveClasses)(prefix, value);
  }, [prefix]);
  return {
    cssVar,
    withPrefix,
    prefix,
    responsive,
    rootPrefix,
    merge: _classnames.default
  };
}
var _default = exports.default = useStyles;