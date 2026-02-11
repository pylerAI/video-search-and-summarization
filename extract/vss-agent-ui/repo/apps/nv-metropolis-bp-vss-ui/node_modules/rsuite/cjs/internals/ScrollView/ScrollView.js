'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../hooks");
var _utils = require("../utils");
var _useScrollState = require("./hooks/useScrollState");
const ScrollView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    classPrefix = 'scroll-view',
    className,
    children,
    scrollShadow,
    customScrollbar,
    height,
    width,
    style,
    onScroll,
    ['data-testid']: dataTestId,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    scrollState,
    handleScroll,
    bodyRef
  } = (0, _useScrollState.useScrollState)(scrollShadow);
  const bodyStyles = {
    height,
    width,
    ...style
  };
  const bodyClasses = merge(className, withPrefix({
    shadow: scrollShadow,
    'thumb-top': scrollState === 'top',
    'thumb-middle': scrollState === 'middle',
    'thumb-bottom': scrollState === 'bottom',
    'custom-scrollbar': customScrollbar
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: (0, _utils.mergeRefs)(ref, bodyRef),
    className: bodyClasses,
    style: bodyStyles,
    onScroll: (0, _utils.createChainedFunction)(handleScroll, onScroll),
    "data-testid": dataTestId || 'scroll-view'
  }), children);
});
ScrollView.displayName = 'ScrollView';
var _default = exports.default = ScrollView;