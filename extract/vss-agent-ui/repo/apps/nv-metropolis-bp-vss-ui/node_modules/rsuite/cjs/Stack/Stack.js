'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _StackItem = _interopRequireDefault(require("./StackItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Subcomponents = {
  Item: _StackItem.default
};

/**
 * The `Stack` component is a quick layout component through Flexbox,
 * supporting vertical and horizontal stacking, custom spacing and line wrapping.
 *
 * @see https://rsuitejs.com/components/stack
 */
const Stack = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Stack', props);
  const {
    as,
    classPrefix = 'stack',
    className,
    children,
    direction,
    divider,
    wrap,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    responsive
  } = (0, _hooks.useStyles)(classPrefix);
  const baseClasses = merge(className, withPrefix(), ...responsive(direction));
  const filteredChildren = _react.default.Children.toArray(children);
  const childCount = filteredChildren.length;
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: baseClasses,
    "data-wrap": wrap
  }, rest), filteredChildren.map((child, index) => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
    key: index
  }, child, index < childCount - 1 && divider)));
}, Subcomponents);
Stack.displayName = 'Stack';
var _default = exports.default = Stack;