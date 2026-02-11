'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _useCombobox = _interopRequireDefault(require("./hooks/useCombobox"));
var _Checkbox = _interopRequireDefault(require("../../Checkbox"));
var _hooks = require("../hooks");
var _utils = require("../utils");
const ListCheckItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    active = false,
    as: Component = 'div',
    checkboxAs: CheckboxItem = _Checkbox.default,
    classPrefix = 'check-item',
    checkable = true,
    disabled,
    value,
    focus,
    children,
    className,
    indeterminate,
    labelClickable,
    onKeyDown,
    onSelect,
    onCheck,
    onSelectItem,
    renderCheckbox,
    ...rest
  } = props;
  const handleChange = (0, _hooks.useEventCallback)((value, checked, event) => {
    onSelect === null || onSelect === void 0 || onSelect(value, event, checked);
  });
  const handleCheck = (0, _hooks.useEventCallback)(event => {
    if (!disabled) {
      onCheck === null || onCheck === void 0 || onCheck(value, event, !active);
    }
  });
  const handleSelectItem = (0, _hooks.useEventCallback)(event => {
    if (!disabled) {
      onSelectItem === null || onSelectItem === void 0 || onSelectItem(value, event, !active);
    }
  });
  const {
    id
  } = (0, _useCombobox.default)();
  const {
    withPrefix,
    merge,
    rootPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const checkboxItemClasses = withPrefix({
    focus
  });
  const checkboxProps = {
    checkable,
    children,
    checked: active,
    className: checkboxItemClasses,
    disabled,
    value,
    indeterminate,
    labelClickable,
    onKeyDown: disabled ? undefined : onKeyDown,
    onChange: handleChange,
    onClick: handleSelectItem,
    onCheckboxClick: handleCheck
  };
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "option",
    "aria-selected": active,
    "aria-disabled": disabled,
    id: id ? `${id}-opt-${value}` : undefined,
    "data-key": value
  }, rest, {
    ref: ref,
    className: merge(className, rootPrefix`picker-list-item`),
    tabIndex: -1
  }), renderCheckbox ? renderCheckbox(checkboxProps) : /*#__PURE__*/_react.default.createElement(CheckboxItem, (0, _extends2.default)({
    role: "checkbox"
  }, checkboxProps)));
});
ListCheckItem.displayName = 'ListCheckItem';
var _default = exports.default = ListCheckItem;