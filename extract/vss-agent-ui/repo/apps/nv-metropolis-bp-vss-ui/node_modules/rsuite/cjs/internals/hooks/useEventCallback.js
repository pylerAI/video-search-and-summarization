'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useEventCallback = useEventCallback;
var _react = require("react");
var _useIsomorphicLayoutEffect = _interopRequireDefault(require("./useIsomorphicLayoutEffect"));
/**
 * https://github.com/facebook/react/issues/14099#issuecomment-440013892
 * @param {function} fn
 */
function useEventCallback(fn) {
  const ref = (0, _react.useRef)(fn);
  /**
   * use useLayoutEffect instead of useEffect.
   * useLayoutEffect is earlier than useEffect, sometimes we use setState and then use callback immediately,
   * However the state in callback is not the latest, because useEffect is not triggered.
   */
  (0, _useIsomorphicLayoutEffect.default)(() => {
    ref.current = fn;
  });
  return (0, _react.useCallback)((...args) => {
    var _ref$current;
    return (_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.call(ref, ...args);
  }, []);
}
var _default = exports.default = useEventCallback;