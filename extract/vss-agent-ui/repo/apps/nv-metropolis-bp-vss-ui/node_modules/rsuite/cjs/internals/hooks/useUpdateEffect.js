'use client';
"use strict";

exports.__esModule = true;
exports.useUpdateEffect = exports.default = void 0;
var _react = require("react");
const useUpdateEffect = (effect, deps) => {
  const isMounting = (0, _react.useRef)(true);
  (0, _react.useEffect)(() => {
    if (isMounting.current) {
      isMounting.current = false;
      return;
    }
    effect();
  }, deps);
};
exports.useUpdateEffect = useUpdateEffect;
var _default = exports.default = useUpdateEffect;