'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _useCombobox = _interopRequireDefault(require("./hooks/useCombobox"));
var _utils = require("../utils");
var _hooks = require("../hooks");
const ListItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    role = 'option',
    classPrefix = 'dropdown-menu-item',
    active,
    children,
    className,
    disabled,
    focus,
    value,
    onKeyDown,
    onSelect,
    renderItem,
    ...rest
  } = props;
  const {
    id
  } = (0, _useCombobox.default)();
  const handleClick = (0, _hooks.useEventCallback)(event => {
    event.preventDefault();
    if (!disabled) {
      onSelect === null || onSelect === void 0 || onSelect(value, event);
    }
  });
  const {
    withPrefix,
    merge,
    rootPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = withPrefix({
    active,
    focus,
    disabled
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: role,
    "aria-selected": active,
    "aria-disabled": disabled,
    id: id ? `${id}-opt-${value}` : undefined,
    "data-key": value
  }, rest, {
    ref: ref,
    className: merge(className, rootPrefix`picker-list-item`),
    tabIndex: -1,
    onKeyDown: disabled ? null : onKeyDown,
    onClick: handleClick
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: classes
  }, renderItem ? renderItem(value) : children));
});
ListItem.displayName = 'ListItem';
var _default = exports.default = ListItem;