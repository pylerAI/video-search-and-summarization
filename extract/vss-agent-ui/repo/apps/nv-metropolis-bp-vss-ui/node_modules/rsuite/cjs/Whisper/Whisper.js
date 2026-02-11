'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _OverlayTrigger = _interopRequireDefault(require("../internals/Overlay/OverlayTrigger"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `Whisper` component is used to display a floating element.
 * It is usually used with the `Tooltip` and `Popover` components.
 *
 * @see https://rsuitejs.com/components/whisper
 */
const Whisper = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    propsWithDefaults,
    rtl
  } = (0, _hooks.useCustom)('Whisper', props);
  const {
    onOpen,
    onClose,
    onEntered,
    onExited,
    placement = 'right',
    preventOverflow,
    ...rest
  } = propsWithDefaults;
  return /*#__PURE__*/_react.default.createElement(_OverlayTrigger.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    preventOverflow: preventOverflow,
    placement: (0, _utils.placementPolyfill)(placement, rtl),
    onEntered: (0, _utils.createChainedFunction)(onOpen, onEntered),
    onExited: (0, _utils.createChainedFunction)(onClose, onExited)
  }));
});
Whisper.displayName = 'Whisper';
var _default = exports.default = Whisper;