'use client';
"use strict";

exports.__esModule = true;
exports.useDateRangePickerContext = exports.DateRangePickerProvider = exports.DateRangePickerContext = void 0;
var _react = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const DateRangePickerContext = exports.DateRangePickerContext = /*#__PURE__*/_react.default.createContext({});
const useDateRangePickerContext = () => {
  return (0, _react.useContext)(DateRangePickerContext) || {};
};
exports.useDateRangePickerContext = useDateRangePickerContext;
const DateRangePickerProvider = exports.DateRangePickerProvider = DateRangePickerContext.Provider;