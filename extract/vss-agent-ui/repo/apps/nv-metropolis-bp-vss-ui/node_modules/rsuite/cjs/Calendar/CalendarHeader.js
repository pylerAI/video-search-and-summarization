'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/PagePrevious"));
var _PageNext = _interopRequireDefault(require("@rsuite/icons/PageNext"));
var _IconButton = _interopRequireDefault(require("../IconButton"));
var _Button = _interopRequireDefault(require("../Button"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _date = require("../internals/utils/date");
var _FormattedDate = require("../internals/intl/FormattedDate");
var _hooks2 = require("./hooks");
var _hooks3 = require("../DateRangePicker/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const CalendarHeader = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-header',
    disabledBackward,
    disabledForward,
    showDate,
    showMonth,
    showTime,
    disabledTime,
    onMoveBackward,
    onMoveForward,
    onToggleMonthDropdown,
    onToggleTimeDropdown,
    renderTitle: renderTitleProp,
    renderToolbar,
    ...rest
  } = props;
  const {
    locale,
    date = new Date(),
    format,
    inline,
    disabledDate,
    targetId
  } = (0, _hooks2.useCalendar)();
  const {
    isSelectedIdle
  } = (0, _hooks3.useDateRangePicker)();
  const {
    prefix,
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const btnProps = {
    appearance: 'subtle',
    size: inline ? 'sm' : 'xs'
  };
  const timeFormat = (0, _react.useMemo)(() => {
    const defaultTimeFormat = (locale === null || locale === void 0 ? void 0 : locale.shortTimeFormat) || 'HH:mm';
    if (!format) {
      return defaultTimeFormat;
    }
    return (0, _date.extractTimeFormat)(format) || defaultTimeFormat;
  }, [format, locale]);
  const dateFormat = (0, _react.useMemo)(() => {
    if (showMonth) {
      return (locale === null || locale === void 0 ? void 0 : locale.formattedMonthPattern) || 'yyyy-MM';
    }
    return 'yyyy';
  }, [locale, showMonth]);
  const renderTitle = () => {
    var _renderTitleProp;
    return (_renderTitleProp = renderTitleProp === null || renderTitleProp === void 0 ? void 0 : renderTitleProp(date)) !== null && _renderTitleProp !== void 0 ? _renderTitleProp : date && /*#__PURE__*/_react.default.createElement(_FormattedDate.FormattedDate, {
      date: date,
      formatStr: dateFormat
    });
  };
  const dateTitleClasses = prefix('title', 'title-date', {
    error: disabledDate === null || disabledDate === void 0 ? void 0 : disabledDate({
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    })
  });
  const timeTitleClasses = prefix('title', 'title-time', {
    error: disabledTime === null || disabledTime === void 0 ? void 0 : disabledTime(date)
  });
  const backwardClass = prefix('backward', {
    'btn-disabled': disabledBackward
  });
  const forwardClass = prefix('forward', {
    'btn-disabled': disabledForward
  });
  const monthToolbar = /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('month-toolbar')
  }, /*#__PURE__*/_react.default.createElement(_IconButton.default, (0, _extends2.default)({}, btnProps, {
    // TODO: aria-label should be translated by i18n
    "aria-label": "Previous month",
    className: backwardClass,
    onClick: disabledBackward ? undefined : onMoveBackward,
    icon: /*#__PURE__*/_react.default.createElement(_PagePrevious.default, null)
  })), /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, btnProps, {
    "aria-label": "Select month",
    id: targetId ? `${targetId}-grid-label` : undefined,
    className: dateTitleClasses,
    onClick: onToggleMonthDropdown
  }), renderTitle()), /*#__PURE__*/_react.default.createElement(_IconButton.default, (0, _extends2.default)({}, btnProps, {
    "aria-label": "Next month",
    className: forwardClass,
    onClick: disabledForward ? undefined : onMoveForward,
    icon: /*#__PURE__*/_react.default.createElement(_PageNext.default, null)
  })));
  const hasMonth = showDate || showMonth;
  const classes = merge(className, withPrefix({
    'has-month': hasMonth,
    'has-time': showTime
  }));

  // If the date is not selected, the time cannot be selected (it only works in DateRangePicker).
  const disableSelectTime = typeof isSelectedIdle === 'undefined' ? false : !isSelectedIdle;
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }), hasMonth && monthToolbar, showTime && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('time-toolbar')
  }, /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, btnProps, {
    "aria-label": "Select time",
    className: timeTitleClasses,
    onClick: onToggleTimeDropdown,
    disabled: disableSelectTime
  }), date && /*#__PURE__*/_react.default.createElement(_FormattedDate.FormattedDate, {
    date: date,
    formatStr: timeFormat
  }))), renderToolbar === null || renderToolbar === void 0 ? void 0 : renderToolbar(date));
});
CalendarHeader.displayName = 'CalendarHeader';
var _default = exports.default = CalendarHeader;