'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _utils = require("../../internals/utils");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
var _getAriaLabel = require("../utils/getAriaLabel");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const MonthDropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-month-dropdown-cell',
    yearMonth,
    active,
    disabled,
    ...rest
  } = props;
  const {
    onChangeMonth
  } = (0, _hooks2.useCalendar)();
  const formatMonth = useFormatMonth();
  const getAriaLabelForMonth = (0, _getAriaLabel.useGetAriaLabelForMonth)();
  const handleClick = (0, _hooks.useEventCallback)(event => {
    if (disabled) {
      return;
    }
    onChangeMonth === null || onChangeMonth === void 0 || onChangeMonth(yearMonth, event);
  });
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    active
  }), {
    disabled
  });
  const ariaLabel = getAriaLabelForMonth(yearMonth);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "gridcell",
    "aria-selected": active,
    "aria-disabled": disabled,
    "aria-label": ariaLabel,
    tabIndex: active ? 0 : -1,
    ref: ref,
    className: classes,
    onClick: handleClick
  }, rest), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('content')
  }, formatMonth(yearMonth)));
});
MonthDropdownItem.displayName = 'MonthDropdownItem';
var _default = exports.default = MonthDropdownItem;
function useFormatMonth() {
  const {
    formatDate
  } = (0, _hooks.useCustom)('Calendar');
  return (0, _react.useCallback)(month => formatDate(new Date(month.year, month.month - 1, 1), 'MMM'), [formatDate]);
}