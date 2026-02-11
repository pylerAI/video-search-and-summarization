'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Search = _interopRequireDefault(require("@rsuite/icons/Search"));
var _Input = _interopRequireDefault(require("../../Input"));
var _InputGroup = _interopRequireDefault(require("../../InputGroup"));
var _hooks = require("../hooks");
var _utils = require("../utils");
const SearchBox = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    classPrefix = 'search-box',
    value,
    className,
    placeholder,
    inputRef,
    onChange,
    ...rest
  } = props;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement(_InputGroup.default, {
    inside: true
  }, /*#__PURE__*/_react.default.createElement(_Input.default, {
    role: "searchbox",
    className: prefix`input`,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    ref: inputRef
  }), /*#__PURE__*/_react.default.createElement(_InputGroup.default.Addon, null, /*#__PURE__*/_react.default.createElement(_Search.default, {
    className: prefix`icon`
  }))));
});
SearchBox.displayName = 'SearchBox';
var _default = exports.default = SearchBox;