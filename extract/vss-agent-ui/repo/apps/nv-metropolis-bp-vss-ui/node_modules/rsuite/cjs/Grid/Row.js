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
var _styles = require("./utils/styles");
/**
 * The Row component is used to create a row container that can contain Col components.
 * @see https://rsuitejs.com/components/grid
 */
const Row = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Row', props);
  const {
    as,
    className,
    classPrefix = 'row',
    style,
    align,
    justify,
    gutter,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    responsive
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix(), ...responsive(align), ...responsive(justify));
  const rowStyles = (0, _utils.mergeStyles)(style, (0, _styles.getResponsiveGutterStyles)(gutter));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: ref,
    className: classes,
    style: rowStyles
  }));
});
Row.displayName = 'Row';
var _default = exports.default = Row;