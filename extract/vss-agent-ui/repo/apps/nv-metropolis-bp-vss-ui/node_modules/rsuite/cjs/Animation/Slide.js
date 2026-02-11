'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Transition = _interopRequireDefault(require("./Transition"));
var _hooks = require("../internals/hooks");
/**
 * Slide animation component
 * @see https://rsuitejs.com/components/animation/#slide
 */
const Slide = /*#__PURE__*/_react.default.forwardRef(({
  timeout = 300,
  placement = 'right',
  ...props
}, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Slide', props);
  const {
    prefix
  } = (0, _hooks.useStyles)('anim');
  const enterClassName = prefix('slide-in', placement);
  const exitClassName = prefix('slide-out', placement);
  return /*#__PURE__*/_react.default.createElement(_Transition.default, (0, _extends2.default)({}, propsWithDefaults, {
    ref: ref,
    animation: true,
    timeout: timeout,
    enteringClassName: enterClassName,
    enteredClassName: enterClassName,
    exitingClassName: exitClassName,
    exitedClassName: exitClassName
  }));
});
Slide.displayName = 'Slide';
var _default = exports.default = Slide;