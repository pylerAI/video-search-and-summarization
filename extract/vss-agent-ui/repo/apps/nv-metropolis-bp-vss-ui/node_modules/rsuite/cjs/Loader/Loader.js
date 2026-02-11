'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `Loader` component is used to indicate the loading state of a page or a section.
 * @see https://rsuitejs.com/components/loader
 */
const Loader = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Loader', props);
  const {
    as,
    classPrefix = 'loader',
    className,
    inverse,
    backdrop,
    speed = 'normal',
    center,
    vertical,
    content,
    size = 'sm',
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const labelId = (0, _hooks.useUniqueId)('loader-label-');
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "status",
    "aria-labelledby": content ? labelId : undefined,
    ref: ref,
    className: classes,
    "data-size": size,
    "data-speed": speed,
    "data-center": backdrop || center,
    "data-direction": vertical ? 'vertical' : 'horizontal',
    "data-inverse": inverse
  }, rest), backdrop && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('backdrop')
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('box')
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('spin')
  }), content && /*#__PURE__*/_react.default.createElement("span", {
    id: labelId,
    className: prefix('content')
  }, content)));
});
Loader.displayName = 'Loader';
var _default = exports.default = Loader;