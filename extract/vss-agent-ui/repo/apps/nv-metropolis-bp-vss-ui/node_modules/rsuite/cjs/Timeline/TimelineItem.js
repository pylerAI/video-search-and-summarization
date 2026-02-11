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
 * The `Timeline.Item` component is used to set the layout of the child element in the `Timeline` component.
 *
 * @see https://rsuitejs.com/compo◊nents/timeline
 */
const TimelineItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'li',
    children,
    classPrefix = 'timeline-item',
    last: DEPRECATED_last,
    className,
    dot,
    time,
    INTERNAL_active,
    ...rest
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    last: DEPRECATED_last,
    active: INTERNAL_active
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('tail')
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('dot', {
      'custom-dot': dot
    })
  }, dot), time && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('time')
  }, time), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, children));
});
TimelineItem.displayName = 'TimelineItem';
var _default = exports.default = TimelineItem;