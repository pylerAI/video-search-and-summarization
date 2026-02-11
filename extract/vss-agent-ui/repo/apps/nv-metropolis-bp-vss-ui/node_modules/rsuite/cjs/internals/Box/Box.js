'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _forwardRef = require("../utils/react/forwardRef");
var _utils = require("./utils");
var _styledSystem = require("../styled-system");
/**
 * Box component is the base component for all components,
 * providing shorthand for style properties.
 *
 * @see https://rsuitejs.com/components/box
 */
const Box = (0, _forwardRef.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    children,
    showFrom,
    hideFrom,
    style,
    ...rest
  } = props;
  const boxProps = (0, _utils.extractBoxProps)(rest);
  const domProps = (0, _utils.omitBoxProps)(rest);
  const boxCSSVars = (0, _styledSystem.getCSSVariables)(boxProps, '--rs-box-');
  const isBox = !(0, _isEmpty.default)(boxCSSVars) || showFrom || hideFrom;
  const styled = (0, _styledSystem.useStyled)({
    cssVars: boxCSSVars,
    className,
    style,
    enabled: isBox
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    "data-rs": isBox ? 'box' : undefined,
    "data-visible-from": showFrom,
    "data-hidden-from": hideFrom,
    className: styled.className,
    style: styled.style
  }, domProps), children);
});
Box.displayName = 'Box';
var _default = exports.default = Box;