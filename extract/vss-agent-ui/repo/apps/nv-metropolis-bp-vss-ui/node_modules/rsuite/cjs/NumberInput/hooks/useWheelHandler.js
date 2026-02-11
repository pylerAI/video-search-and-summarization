'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.useWheelHandler = useWheelHandler;
var _react = require("react");
var _on = _interopRequireDefault(require("dom-lib/on"));
/**
 * Attach wheel listener to inputRef.
 */
function useWheelHandler(inputRef, handleWheel, scrollable) {
  (0, _react.useEffect)(() => {
    let wheelListener;
    if (inputRef.current) {
      wheelListener = (0, _on.default)(inputRef.current, 'wheel', handleWheel, {
        passive: false
      });
    }
    return () => {
      var _wheelListener;
      (_wheelListener = wheelListener) === null || _wheelListener === void 0 || _wheelListener.off();
    };
  }, [inputRef, handleWheel, scrollable]);
}