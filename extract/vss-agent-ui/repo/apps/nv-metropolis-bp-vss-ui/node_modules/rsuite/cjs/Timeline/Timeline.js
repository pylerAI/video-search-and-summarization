'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _some = _interopRequireDefault(require("lodash/some"));
var _TimelineItem = _interopRequireDefault(require("./TimelineItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const ACTIVE_FIRST = index => index === 0;
const ACTIVE_LAST = (index, totalItemsCount) => index === totalItemsCount - 1;
const SubcomponentsAndStaticMethods = {
  Item: _TimelineItem.default,
  ACTIVE_FIRST,
  ACTIVE_LAST
};

/**
 * The `Timeline` component is used to display a list of items in chronological order.
 *
 * @see https://rsuitejs.com/components/timeline
 */
const Timeline = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Timeline', props);
  const {
    as = 'ul',
    children,
    classPrefix = 'timeline',
    className,
    align = 'left',
    endless,
    isItemActive = ACTIVE_LAST,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const count = _utils.rch.count(children);
  const withTime = (0, _some.default)(_react.default.Children.toArray(children), item => {
    var _item$props;
    return item === null || item === void 0 || (_item$props = item.props) === null || _item$props === void 0 ? void 0 : _item$props.time;
  });
  const classes = merge(className, withPrefix(`align-${align}`, {
    endless,
    'with-time': withTime
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), _utils.rch.mapCloneElement(children, (_child, index) => ({
    last: index + 1 === count,
    INTERNAL_active: isItemActive(index, count),
    align
  })));
}, SubcomponentsAndStaticMethods);
Timeline.displayName = 'Timeline';
var _default = exports.default = Timeline;