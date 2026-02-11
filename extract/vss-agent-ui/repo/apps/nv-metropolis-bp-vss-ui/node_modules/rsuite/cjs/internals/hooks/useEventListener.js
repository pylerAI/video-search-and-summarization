'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useEventListener = useEventListener;
var _react = require("react");
var _on = _interopRequireDefault(require("dom-lib/on"));
/**
 * Attach the event handler directly to the specified DOM element.
 *
 * @param element The target to listen for events on
 * @param event The DOM event name
 * @param handler An event handler
 * @param capture Whether or not to listen during the capture event phase
 */
function useEventListener(eventTarget, event, listener, capture = false) {
  (0, _react.useEffect)(() => {
    const target = typeof eventTarget === 'function' ? eventTarget() : eventTarget;
    const controller = target ? (0, _on.default)(target, event, listener, capture) : null;
    return () => {
      controller === null || controller === void 0 || controller.off();
    };
  }, [eventTarget, event, listener, capture]);
}
var _default = exports.default = useEventListener;