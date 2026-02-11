'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _CardHeader = _interopRequireDefault(require("./CardHeader"));
var _CardBody = _interopRequireDefault(require("./CardBody"));
var _CardFooter = _interopRequireDefault(require("./CardFooter"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Subcomponents = {
  Header: _CardHeader.default,
  Body: _CardBody.default,
  Footer: _CardFooter.default
};
const Card = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Card', props);
  const {
    as,
    bordered = true,
    classPrefix = 'card',
    className,
    children,
    direction,
    shaded,
    style,
    size,
    width,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const styles = (0, _utils.mergeStyles)(style, cssVar('width', width, _utils.getCssValue));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles,
    "data-size": size,
    "data-direction": direction,
    "data-bordered": bordered,
    "data-shaded": shaded
  }, rest), children);
}, Subcomponents);
Card.displayName = 'Card';
var _default = exports.default = Card;