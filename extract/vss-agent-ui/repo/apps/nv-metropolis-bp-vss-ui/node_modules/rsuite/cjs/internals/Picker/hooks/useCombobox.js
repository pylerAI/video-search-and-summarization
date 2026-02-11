'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _PickerToggleTrigger = require("../PickerToggleTrigger");
function useCombobox() {
  const {
    id,
    hasLabel,
    popupType,
    multiple,
    placement,
    breakpoint
  } = (0, _react.useContext)(_PickerToggleTrigger.ComboboxContext);
  return {
    id,
    popupType,
    multiple,
    placement,
    breakpoint,
    labelId: hasLabel ? `${id}-label` : undefined
  };
}
var _default = exports.default = useCombobox;