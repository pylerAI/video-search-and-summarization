'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 * The `Placeholder.Graph` component is used to display the loading state of the block.
 * @see https://rsuitejs.com/components/placeholder
 */
const PlaceholderGraph = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('PlaceholderGraph', props);
  const {
    as,
    className,
    classPrefix = 'placeholder',
    width,
    height,
    style,
    active,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    cssVar,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix('graph'));
  const styles = (0, _utils.mergeStyles)(style, cssVar('graph-width', width, _utils.getCssValue), cssVar('graph-height', height, _utils.getCssValue));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles,
    "data-active": active
  }, rest));
});
PlaceholderGraph.displayName = 'PlaceholderGraph';
var _default = exports.default = PlaceholderGraph;