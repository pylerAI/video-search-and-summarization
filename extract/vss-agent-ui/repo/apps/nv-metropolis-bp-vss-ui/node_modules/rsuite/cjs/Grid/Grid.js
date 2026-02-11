'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The Grid component is used to specify the layout of child elements in rows and columns.
 * @see https://rsuitejs.com/components/grid
 */
const Grid = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Grid', props);
  const {
    as,
    classPrefix = 'grid-container',
    className,
    fluid,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, fluid ? prefix({
    fluid
  }) : withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: ref,
    className: classes
  }));
});
Grid.displayName = 'Grid';
var _default = exports.default = Grid;