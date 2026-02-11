'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.useRenderMenuItem = useRenderMenuItem;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../Box"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function useRenderMenuItem(as) {
  return (0, _react.useCallback)((props, overrideAs) => {
    if (as === 'li') {
      if (overrideAs) {
        return /*#__PURE__*/_react.default.createElement("li", {
          role: "none presentation"
        }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
          as: overrideAs
        }, props)));
      }
      return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
        as: as
      }, props));
    }
    return /*#__PURE__*/_react.default.createElement("li", {
      role: "none presentation"
    }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as
    }, props)));
  }, [as]);
}