'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _useCombobox = _interopRequireDefault(require("../internals/Picker/hooks/useCombobox"));
var _hooks = require("../internals/hooks");
const TagList = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    children,
    ...rest
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)('picker');
  const {
    id
  } = (0, _useCombobox.default)();
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    ref: ref,
    role: "listbox",
    id: `${id}-describe`,
    className: prefix`tag-list`
  }, rest), children);
});
TagList.displayName = 'TagList';
var _default = exports.default = TagList;