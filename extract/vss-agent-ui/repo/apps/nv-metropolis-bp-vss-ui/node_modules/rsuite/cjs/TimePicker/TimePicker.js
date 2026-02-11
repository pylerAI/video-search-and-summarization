'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _DatePicker = _interopRequireDefault(require("../DatePicker"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const TimePicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults,
    getLocale
  } = (0, _hooks.useCustom)('TimePicker', props);
  const locale = getLocale('DateTimeFormats');
  const defaultRanges = (0, _react.useMemo)(() => [{
    label: locale === null || locale === void 0 ? void 0 : locale.now,
    value: () => new Date()
  }], [locale]);
  return /*#__PURE__*/_react.default.createElement(_DatePicker.default, (0, _extends2.default)({
    ref: ref,
    format: locale === null || locale === void 0 ? void 0 : locale.shortTimeFormat,
    ranges: defaultRanges
  }, propsWithDefaults));
});
TimePicker.displayName = 'TimePicker';
var _default = exports.default = TimePicker;