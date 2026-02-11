'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Button = _interopRequireDefault(require("../Button"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 * PaginationButton component for pagination navigation.
 * Renders a button that can be used in pagination contexts.
 */
const PaginationButton = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    active,
    disabled,
    className,
    classPrefix = 'pagination-btn',
    children,
    eventKey,
    onSelect,
    onClick,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const handleClick = (0, _hooks.useEventCallback)(event => {
    if (disabled) {
      return;
    }
    onClick === null || onClick === void 0 || onClick(event);

    // Only call onSelect if the event hasn't been prevented
    if (!event.defaultPrevented && onSelect) {
      onSelect(eventKey, event);
    }
  });
  return /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, rest, {
    as: as,
    disabled: disabled,
    onClick: handleClick,
    ref: ref,
    className: classes,
    appearance: "subtle",
    "aria-disabled": disabled,
    "aria-current": active ? 'page' : undefined,
    active: active,
    "data-event-key": eventKey
  }), children);
});
PaginationButton.displayName = 'PaginationButton';
var _default = exports.default = PaginationButton;