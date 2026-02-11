'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _FlexboxGridItem = _interopRequireDefault(require("./FlexboxGridItem"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Subcomponents = {
  Item: _FlexboxGridItem.default
};

/**
 * The FlexboxGrid component is a box that can be used to layout other components.
 * @see https://rsuitejs.com/components/flexbox-grid
 * @deprecated Please use `Row` instead.
 * ```
 * <Row>
 *   <Col>1</Col>
 *   <Col>2</Col>
 *   <Col>3</Col>
 * </Row>
 * ```
 */
const FlexboxGrid = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('FlexboxGrid', props);
  const {
    as: Component = 'div',
    className,
    classPrefix = 'flex-box-grid',
    align = 'top',
    justify = 'start',
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix(align, justify));
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }));
}, Subcomponents);
FlexboxGrid.displayName = 'FlexboxGrid';
var _default = exports.default = FlexboxGrid;