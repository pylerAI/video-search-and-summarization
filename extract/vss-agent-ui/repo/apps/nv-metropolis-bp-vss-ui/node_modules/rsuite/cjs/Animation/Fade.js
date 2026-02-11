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
 * Fade animation component
 * @see https://rsuitejs.com/components/animation/#fade
 */
const Fade = /*#__PURE__*/_react.default.forwardRef(({
  timeout = 300,
  className,
  ...props
}, ref) => {
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)('anim');
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Fade', props);
  return /*#__PURE__*/_react.default.createElement(_Transition.default, (0, _extends2.default)({}, propsWithDefaults, {
    ref: ref,
    timeout: timeout,
    className: merge(className, prefix('fade')),
    enteredClassName: prefix('in'),
    enteringClassName: prefix('in')
  }));
});
Fade.displayName = 'Fade';
var _default = exports.default = Fade;