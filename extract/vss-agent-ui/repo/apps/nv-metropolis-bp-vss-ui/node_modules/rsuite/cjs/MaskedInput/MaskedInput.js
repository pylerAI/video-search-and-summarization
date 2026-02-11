'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _TextMask = _interopRequireDefault(require("./TextMask"));
var _Input = _interopRequireDefault(require("../Input"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const MaskedInput = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('MaskedInput', props);
  const {
    as: inputAs = _TextMask.default
  } = propsWithDefaults;
  return /*#__PURE__*/_react.default.createElement(_Input.default, (0, _extends2.default)({}, propsWithDefaults, {
    as: inputAs,
    ref: ref
  }));
});
MaskedInput.displayName = 'MaskedInput';
var _default = exports.default = MaskedInput;