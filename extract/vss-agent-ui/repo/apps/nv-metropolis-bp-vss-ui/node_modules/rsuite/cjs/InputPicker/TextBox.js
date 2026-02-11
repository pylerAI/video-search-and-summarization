'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _TagList = _interopRequireDefault(require("./TagList"));
var _InputSearch = _interopRequireDefault(require("./InputSearch"));
var _hooks = require("../internals/hooks");
const TextBox = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    tags,
    inputProps,
    readOnly,
    disabled,
    multiple,
    onBlur,
    onFocus,
    onChange,
    inputValue,
    inputRef,
    editable,
    showTagList,
    ...rest
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)('picker');
  if (!multiple && disabled) {
    return null;
  }
  const input = editable ? /*#__PURE__*/_react.default.createElement(_InputSearch.default, (0, _extends2.default)({}, inputProps, {
    tabIndex: -1,
    readOnly: readOnly,
    onBlur: onBlur,
    onFocus: onFocus,
    inputRef: inputRef,
    onChange: onChange,
    value: inputValue
  })) : null;
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: prefix`textbox`,
    ref: ref
  }, rest), showTagList ? /*#__PURE__*/_react.default.createElement(_TagList.default, null, tags, input) : input);
});
TextBox.displayName = 'TextBox';
var _default = exports.default = TextBox;