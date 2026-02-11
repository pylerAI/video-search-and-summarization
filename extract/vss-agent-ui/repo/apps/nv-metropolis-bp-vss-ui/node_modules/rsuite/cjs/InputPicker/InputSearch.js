'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const InputSearch = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'input',
    classPrefix = 'picker-search',
    children,
    className,
    value,
    inputRef,
    style,
    readOnly,
    onChange,
    ...rest
  } = props;
  const handleChange = (0, _hooks.useEventCallback)(event => {
    var _event$target;
    onChange === null || onChange === void 0 || onChange(event === null || event === void 0 || (_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value, event);
  });
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: ref,
    className: classes,
    style: style
  }, /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: inputRef,
    readOnly: readOnly,
    className: prefix`input`,
    value: value,
    onChange: handleChange
  })), children);
});
InputSearch.displayName = 'InputSearch';
var _default = exports.default = InputSearch;