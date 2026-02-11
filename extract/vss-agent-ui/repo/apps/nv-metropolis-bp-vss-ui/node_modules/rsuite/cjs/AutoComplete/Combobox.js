'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Input = _interopRequireDefault(require("../Input"));
var _Picker = require("../internals/Picker");
var _utils = require("../internals/utils");
const Combobox = (0, _utils.forwardRef)((props, ref) => {
  const {
    id,
    popupType
  } = (0, _Picker.useCombobox)();
  const {
    expanded,
    focusItemValue,
    ...rest
  } = props;
  return /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({
    role: "combobox",
    "aria-autocomplete": "list",
    "aria-haspopup": popupType,
    "aria-expanded": expanded,
    "aria-activedescendant": focusItemValue ? `${id}-opt-${focusItemValue}` : undefined,
    autoComplete: "off",
    id: id,
    ref: ref
  }, rest));
});
Combobox.displayName = 'Combobox';
var _default = exports.default = Combobox;