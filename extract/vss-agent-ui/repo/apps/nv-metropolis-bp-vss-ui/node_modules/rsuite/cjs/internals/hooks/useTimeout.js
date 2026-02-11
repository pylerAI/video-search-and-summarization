'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useTimeout = useTimeout;
var _react = require("react");
/**
 * A timer hook
 * @param fn Timer callback function
 * @param ms Milliseconds of the timer
 * @param enabled Whether to open the timer
 */
function useTimeout(fn, ms = 0, enabled = true) {
  const timeout = (0, _react.useRef)(null);
  const callback = (0, _react.useRef)(fn);
  const clear = (0, _react.useCallback)(() => {
    timeout.current && clearTimeout(timeout.current);
  }, []);
  const set = (0, _react.useCallback)(() => {
    timeout.current && clearTimeout(timeout.current);
    if (enabled) {
      timeout.current = setTimeout(() => {
        var _callback$current;
        (_callback$current = callback.current) === null || _callback$current === void 0 || _callback$current.call(callback);
      }, ms);
    }
  }, [ms, enabled]);

  // update ref when function changes
  (0, _react.useEffect)(() => {
    callback.current = fn;
  }, [fn]);
  (0, _react.useEffect)(() => {
    set();
    return clear;
  }, [ms, enabled, set, clear]);
  return {
    clear,
    reset: set
  };
}
var _default = exports.default = useTimeout;