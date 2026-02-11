'use client';
"use strict";

exports.__esModule = true;
exports.FormattedNumber = FormattedNumber;
var _react = _interopRequireWildcard(require("react"));
var _hooks = require("../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function FormattedNumber({
  value,
  formatOptions
}) {
  const {
    code
  } = (0, _hooks.useCustom)();
  const formatter = (0, _react.useMemo)(() => new Intl.NumberFormat(code, formatOptions), [code, formatOptions]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, formatter.format(value));
}