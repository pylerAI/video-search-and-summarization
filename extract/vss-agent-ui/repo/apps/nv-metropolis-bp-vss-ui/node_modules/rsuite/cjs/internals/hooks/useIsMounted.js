'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useIsMounted = useIsMounted;
var _react = require("react");
function useIsMounted() {
  const isMounted = (0, _react.useRef)(false);
  (0, _react.useEffect)(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return (0, _react.useCallback)(() => isMounted.current, []);
}
var _default = exports.default = useIsMounted;