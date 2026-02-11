'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _partial = _interopRequireDefault(require("lodash/partial"));
var _camelCase = _interopRequireDefault(require("lodash/camelCase"));
var _isNumber = _interopRequireDefault(require("lodash/isNumber"));
var _TimeColumn = _interopRequireDefault(require("./TimeColumn"));
var _utils = require("../../internals/utils");
var _hooks = require("../../internals/hooks");
var _date = require("../../internals/utils/date");
var _hooks2 = require("../hooks");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const TimeDropdown = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-time-dropdown',
    show,
    showMeridiem = false,
    ...rest
  } = props;
  const {
    locale,
    format,
    date,
    onChangeTime,
    targetId
  } = (0, _hooks2.useCalendar)();
  const rowRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    const time = (0, _utils2.getClockTime)({
      format,
      date,
      showMeridiem
    });
    // The currently selected time scrolls to the visible range.
    if (show && rowRef.current) {
      (0, _utils2.scrollToTime)(time, rowRef.current);
    }
  }, [date, format, show, showMeridiem]);
  const time = (0, _utils2.getClockTime)({
    format,
    date,
    showMeridiem
  });
  const handleClick = (0, _hooks.useEventCallback)((type, d, event) => {
    var _time$hours, _time$minutes, _time$seconds;
    const nextTime = {
      hour: ((_time$hours = time.hours) !== null && _time$hours !== void 0 ? _time$hours : 0) + (time.meridiem === 'PM' ? 12 : 0),
      minute: (_time$minutes = time.minutes) !== null && _time$minutes !== void 0 ? _time$minutes : 0,
      second: (_time$seconds = time.seconds) !== null && _time$seconds !== void 0 ? _time$seconds : 0
    };
    switch (type) {
      case 'hours':
        nextTime.hour = time.meridiem === 'PM' ? d + 12 : d;
        break;
      case 'minutes':
        nextTime.minute = d;
        break;
      case 'seconds':
        nextTime.second = d;
        break;
    }
    onChangeTime === null || onChangeTime === void 0 || onChangeTime(nextTime, event);
  });
  const handleClickMeridiem = (0, _hooks.useEventCallback)((meridiem, event) => {
    var _time$hours2, _time$minutes2, _time$seconds2;
    const nextTime = {
      hour: ((_time$hours2 = time.hours) !== null && _time$hours2 !== void 0 ? _time$hours2 : 0) + (time.meridiem === 'PM' ? 12 : 0),
      minute: (_time$minutes2 = time.minutes) !== null && _time$minutes2 !== void 0 ? _time$minutes2 : 0,
      second: (_time$seconds2 = time.seconds) !== null && _time$seconds2 !== void 0 ? _time$seconds2 : 0
    };
    if (meridiem === 'AM' && nextTime.hour >= 12) {
      nextTime.hour -= 12;
    } else if (meridiem === 'PM' && nextTime.hour < 12) {
      nextTime.hour += 12;
    }
    onChangeTime === null || onChangeTime === void 0 || onChangeTime(nextTime, event);
  });
  const {
    prefix,
    rootPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const plainDate = typeof date !== 'undefined' ? {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  } : undefined;
  const renderColumn = (type, value) => {
    if (!(0, _isNumber.default)(value)) {
      return null;
    }
    const {
      start,
      end
    } = (0, _utils2.getTimeLimits)(showMeridiem)[type];
    const items = [];
    const hideFunc = props[(0, _camelCase.default)(`hide_${type}`)];
    const disabledFunc = props[(0, _camelCase.default)(`disabled_${type}`)];
    for (let i = start; i <= end; i += 1) {
      if (!(hideFunc !== null && hideFunc !== void 0 && hideFunc(i, plainDate))) {
        const disabled = disabledFunc === null || disabledFunc === void 0 ? void 0 : disabledFunc(i, plainDate);
        const itemClasses = prefix('cell', {
          'cell-active': value === i,
          'cell-disabled': disabled
        });
        items.push(/*#__PURE__*/_react.default.createElement("li", {
          key: i,
          role: "option",
          tabIndex: -1,
          "aria-label": `${i} ${type}`,
          "aria-selected": value === i,
          "aria-disabled": disabled,
          "data-key": `${type}-${i}`,
          onClick: !disabled ? (0, _partial.default)(handleClick, type, i) : undefined
        }, /*#__PURE__*/_react.default.createElement("span", {
          className: itemClasses
        }, showMeridiem && type === 'hours' && i === 0 ? 12 : (0, _utils2.formatWithLeadingZero)(i))));
      }
    }
    return /*#__PURE__*/_react.default.createElement(_TimeColumn.default, {
      prefix: prefix,
      title: locale === null || locale === void 0 ? void 0 : locale[type],
      "data-type": type,
      "aria-label": `Select ${type}`
    }, items);
  };
  const renderMeridiemColumn = () => {
    const columns = ['AM', 'PM'];
    return /*#__PURE__*/_react.default.createElement(_TimeColumn.default, {
      prefix: prefix,
      title: 'AM/PM',
      "data-type": "meridiem",
      "aria-label": "Select meridiem"
    }, columns.map((meridiem, index) => {
      const ampm = date && ((0, _date.getHours)(date) >= 12 ? 'PM' : 'AM');
      const itemClasses = prefix('cell', {
        'cell-active': ampm === meridiem
      });
      return /*#__PURE__*/_react.default.createElement("li", {
        key: index,
        role: "option",
        tabIndex: -1,
        "aria-label": meridiem,
        "aria-selected": ampm === meridiem,
        "data-key": `meridiem-${meridiem}`,
        onClick: (0, _partial.default)(handleClickMeridiem, meridiem)
      }, /*#__PURE__*/_react.default.createElement("span", {
        className: itemClasses
      }, meridiem));
    }));
  };
  const classes = merge(className, rootPrefix(classPrefix), {
    show
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "group",
    tabIndex: -1,
    id: targetId ? `${targetId}-${classPrefix}` : undefined
  }, (0, _date.omitHideDisabledProps)(rest), {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('row'),
    ref: rowRef
  }, renderColumn('hours', time.hours), renderColumn('minutes', time.minutes), renderColumn('seconds', time.seconds), showMeridiem && renderMeridiemColumn())));
});
TimeDropdown.displayName = 'TimeDropdown';
var _default = exports.default = TimeDropdown;