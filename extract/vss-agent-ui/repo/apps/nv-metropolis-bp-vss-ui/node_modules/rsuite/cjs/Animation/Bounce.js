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
 * Bounce animation component
 * @see https://rsuitejs.com/components/animation/#bounce
 */
const Bounce = /*#__PURE__*/_react.default.forwardRef(({
  timeout = 300,
  ...props
}, ref) => {
  const {
    prefix
  } = (0, _hooks.useStyles)('anim');
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Bounce', props);
  return /*#__PURE__*/_react.default.createElement(_Transition.default, (0, _extends2.default)({}, propsWithDefaults, {
    ref: ref,
    animation: true,
    timeout: timeout,
    enteringClassName: prefix('bounce-in'),
    enteredClassName: prefix('bounce-in'),
    exitingClassName: prefix('bounce-out'),
    exitedClassName: prefix('bounce-out')
  }));
});
Bounce.displayName = 'Bounce';
var _default = exports.default = Bounce;