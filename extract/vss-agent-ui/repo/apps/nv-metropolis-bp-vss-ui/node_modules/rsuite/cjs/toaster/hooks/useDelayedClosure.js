'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _on = _interopRequireDefault(require("dom-lib/on"));
var _hooks = require("../../internals/hooks");
var _ToastContext = _interopRequireDefault(require("../ToastContext"));
/**
 * A hook that delays the closure of the message box.
 */
function useDelayedClosure(props) {
  const {
    onClose,
    duration: durationProp,
    targetRef
  } = props;
  const {
    usedToaster,
    duration = durationProp,
    mouseReset
  } = (0, _react.useContext)(_ToastContext.default);
  const mouseEnterRef = (0, _react.useRef)(null);
  const mouseLeaveRef = (0, _react.useRef)(null);
  const {
    clear,
    reset
  } = (0, _hooks.useTimeout)(onClose, duration, usedToaster && duration > 0);
  (0, _hooks.useMount)(() => {
    if (targetRef !== null && targetRef !== void 0 && targetRef.current && mouseReset) {
      if (mouseEnterRef.current || mouseLeaveRef.current) {
        return;
      }
      mouseEnterRef.current = (0, _on.default)(targetRef.current, 'mouseenter', clear);
      mouseLeaveRef.current = (0, _on.default)(targetRef.current, 'mouseleave', reset);
      return () => {
        var _mouseEnterRef$curren, _mouseLeaveRef$curren;
        (_mouseEnterRef$curren = mouseEnterRef.current) === null || _mouseEnterRef$curren === void 0 || _mouseEnterRef$curren.off();
        (_mouseLeaveRef$curren = mouseLeaveRef.current) === null || _mouseLeaveRef$curren === void 0 || _mouseLeaveRef$curren.off();
      };
    }
  });
  return {
    clear,
    reset
  };
}
var _default = exports.default = useDelayedClosure;