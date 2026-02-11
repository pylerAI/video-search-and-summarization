'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Button = _interopRequireDefault(require("../Button"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _hooks = require("../internals/hooks");
var _utils = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const PredefinedRanges = /*#__PURE__*/_react.default.forwardRef(function PredefinedRanges(props, ref) {
  const {
    className,
    disableShortcut,
    onShortcutClick,
    calendarDate,
    ranges: rangesProp,
    locale,
    ...rest
  } = props;
  const [ranges, setRanges] = (0, _react.useState)((0, _utils.getRanges)(props));
  (0, _hooks.useUpdateEffect)(() => {
    setRanges((0, _utils.getRanges)({
      ranges: rangesProp,
      calendarDate
    }));
  }, [calendarDate, rangesProp]);
  const hasLocaleKey = (0, _react.useCallback)(key => (0, _utils.getDefaultRanges)(calendarDate).some(item => item.label === key), [calendarDate]);
  if (ranges.length === 0) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(_Stack.default, (0, _extends2.default)({
    className: className,
    ref: ref,
    align: "flex-start",
    spacing: 4
  }, rest), ranges.map((range, index) => {
    const {
      value,
      closeOverlay,
      label,
      ...rest
    } = range;
    const disabled = disableShortcut === null || disableShortcut === void 0 ? void 0 : disableShortcut(value);
    const handleClickShortcut = event => {
      if (disabled) {
        return;
      }
      onShortcutClick === null || onShortcutClick === void 0 || onShortcutClick(range, closeOverlay !== false ? true : false, event);
    };
    return /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({
      appearance: "link",
      size: "sm",
      key: index,
      disabled: disabled,
      onClick: handleClickShortcut
    }, rest), hasLocaleKey(label) && typeof label === 'string' ? locale === null || locale === void 0 ? void 0 : locale[label] : label);
  }));
});
var _default = exports.default = PredefinedRanges;