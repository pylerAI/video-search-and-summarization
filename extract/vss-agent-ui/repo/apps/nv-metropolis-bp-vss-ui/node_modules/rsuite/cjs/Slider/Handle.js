'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Tooltip = _interopRequireDefault(require("../Tooltip"));
var _Input = _interopRequireDefault(require("./Input"));
var _useDrag = _interopRequireDefault(require("./useDrag"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Handle = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    classPrefix = 'slider',
    className,
    disabled,
    style,
    children,
    position,
    vertical,
    tooltip,
    value,
    role,
    tabIndex,
    keepTooltipOpen,
    renderTooltip,
    onDragStart,
    onDragMove,
    onDragEnd,
    onKeyDown,
    'data-range': dataRange,
    'data-key': dateKey,
    ...rest
  } = props;
  const actualTooltip = tooltip || keepTooltipOpen;
  const {
    merge,
    prefix,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const styles = (0, _utils.mergeStyles)(style, cssVar('offset', `${position}%`));
  const {
    active,
    onMoveStart,
    onMouseEnter,
    rootRef,
    tooltipRef
  } = (0, _useDrag.default)({
    tooltip: actualTooltip,
    disabled,
    onDragStart,
    onDragMove,
    onDragEnd,
    keepTooltipOpen
  });
  const handleClasses = merge(className, prefix('handle'), {
    active: active || keepTooltipOpen
  });
  return /*#__PURE__*/_react.default.createElement(_Box.default, {
    as: as,
    role: role,
    tabIndex: tabIndex,
    ref: (0, _utils.mergeRefs)(ref, rootRef),
    className: handleClasses,
    onMouseDown: onMoveStart,
    onMouseEnter: onMouseEnter,
    onTouchStart: onMoveStart,
    onKeyDown: onKeyDown,
    style: styles,
    "data-range": dataRange,
    "data-key": dateKey,
    "data-testid": "slider-handle"
  }, actualTooltip && /*#__PURE__*/_react.default.createElement(_Tooltip.default, {
    "aria-hidden": "true",
    ref: tooltipRef,
    className: prefix('tooltip'),
    "data-placement": vertical ? 'left' : 'top'
  }, renderTooltip ? renderTooltip(value) : value), /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({
    tabIndex: -1,
    value: value
  }, rest)), children);
});
Handle.displayName = 'Handle';
var _default = exports.default = Handle;