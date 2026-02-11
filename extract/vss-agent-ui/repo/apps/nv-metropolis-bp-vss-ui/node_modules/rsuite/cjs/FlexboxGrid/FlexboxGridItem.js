'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `FlexboxGrid.Item` component is used to specify the layout of the child element in the `FlexboxGrid` component.
 * @see https://rsuitejs.com/components/flexbox-grid
 * @deprecated Please use `Col` instead.
 */
const FlexboxGridItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'flex-box-grid-item',
    colspan = 0,
    order = 0,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    [colspan]: colspan > 0,
    [`order-${order}`]: order
  }));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref
  }, rest, {
    className: classes
  }));
});
FlexboxGridItem.displayName = 'FlexboxGridItem';
var _default = exports.default = FlexboxGridItem;