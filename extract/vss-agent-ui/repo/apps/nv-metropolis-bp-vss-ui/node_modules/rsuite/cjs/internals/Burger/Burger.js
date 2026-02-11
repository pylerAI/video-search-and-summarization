'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../Box"));
var _utils = require("../utils");
var _hooks = require("../hooks");
/**
 * Burger (hamburger menu) button for toggling navigation menus.
 */
const Burger = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'button',
    classPrefix = 'burger',
    className,
    color,
    open = false,
    lineThickness,
    style,
    ...rest
  } = props;
  const {
    withPrefix,
    merge,
    cssVar,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const mergedStyle = (0, _utils.mergeStyles)(style, cssVar('thickness', (0, _utils.getCssValue)(lineThickness)), (0, _utils.getColorStyle)(color, 'burger'));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "aria-pressed": open,
    "data-opened": open,
    style: mergedStyle
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('line')
  }));
});
Burger.displayName = 'Burger';
var _default = exports.default = Burger;