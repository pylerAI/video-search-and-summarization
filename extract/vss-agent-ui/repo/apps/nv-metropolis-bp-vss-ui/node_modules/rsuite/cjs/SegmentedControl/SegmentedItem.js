'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
const SegmentedItem = ({
  item,
  index,
  name,
  active,
  disabled,
  classPrefix,
  onChange
}) => {
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleChange = event => {
    if (disabled) return;
    onChange(item.value, event);
  };
  return /*#__PURE__*/_react.default.createElement("label", {
    className: prefix('item'),
    "data-value": item.value,
    "data-index": index,
    "data-active": active || undefined,
    "data-disabled": disabled || undefined
  }, /*#__PURE__*/_react.default.createElement("input", {
    type: "radio",
    name: name,
    value: String(item.value),
    checked: active,
    disabled: disabled,
    onChange: handleChange,
    className: prefix('radio')
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('label')
  }, item.label));
};
SegmentedItem.displayName = 'SegmentedItem';
var _default = exports.default = SegmentedItem;