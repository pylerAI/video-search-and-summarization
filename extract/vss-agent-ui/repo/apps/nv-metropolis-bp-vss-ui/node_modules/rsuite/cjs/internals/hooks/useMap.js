'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useMap = useMap;
var _react = require("react");
function useMap() {
  const [map, setMap] = (0, _react.useState)(() => new Map());
  return (0, _react.useMemo)(() => {
    return {
      has(key) {
        return map.has(key);
      },
      get(key) {
        return map.get(key);
      },
      set(key, value) {
        setMap(prev => {
          const copy = new Map(prev);
          copy.set(key, value);
          return copy;
        });
      },
      clear() {
        setMap(new Map());
      }
    };
  }, [map]);
}
var _default = exports.default = useMap;