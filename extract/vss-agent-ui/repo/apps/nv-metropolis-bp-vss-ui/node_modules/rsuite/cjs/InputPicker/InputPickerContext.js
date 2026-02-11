'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.TagProvider = void 0;
exports.useTagContext = useTagContext;
var _react = _interopRequireDefault(require("react"));
const InputPickerContext = /*#__PURE__*/_react.default.createContext({
  tagProps: {},
  trigger: 'Enter'
});
function useTagContext() {
  return _react.default.useContext(InputPickerContext);
}
const TagProvider = exports.TagProvider = InputPickerContext.Provider;
var _default = exports.default = InputPickerContext;