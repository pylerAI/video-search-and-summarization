'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _MonthDropdownItem = _interopRequireDefault(require("./MonthDropdownItem"));
var _utils = require("../../internals/utils");
var _date = require("../../internals/utils/date");
var _Windowing = require("../../internals/Windowing");
var _hooks = require("../../internals/hooks");
var _hooks2 = require("../hooks");
var _plainDate = require("../../internals/utils/date/plainDate");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Array representing the index of each month
const MONTHS_INDEX = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// The height of each item
const ITEM_SIZE = 108;
const MonthDropdown = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'calendar-month-dropdown',
    limitStartYear,
    limitEndYear = 5,
    show,
    height: defaultHeight = 221,
    width: defaultWidth = 256,
    isMonthDisabled,
    ...rest
  } = props;
  const {
    date = new Date(),
    targetId,
    monthDropdownProps
  } = (0, _hooks2.useCalendar)();
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const thisYear = (0, _date.getYear)(new Date());
  const startYear = limitStartYear ? thisYear - limitStartYear + 1 : 1900;
  const rowCount = (0, _react.useMemo)(() => {
    const endYear = thisYear + limitEndYear;
    return endYear - startYear;
  }, [limitEndYear, startYear, thisYear]);
  const {
    className: listClassName,
    itemClassName,
    as: List,
    itemAs: Item = 'div',
    ...restListProps
  } = monthDropdownProps || {};
  const rowRenderer = (0, _react.useCallback)(({
    index,
    style
  }) => {
    const selectedMonth = (0, _date.getMonth)(date);
    const selectedYear = (0, _date.getYear)(date);
    const year = startYear + index;
    const isSelectedYear = year === selectedYear;
    const titleClassName = prefix('year', {
      'year-active': isSelectedYear
    });
    return /*#__PURE__*/_react.default.createElement(Item, {
      role: "row",
      "aria-label": `${year}`,
      className: merge(itemClassName, prefix('row'), {
        'first-row': index === 0,
        'last-row': index === rowCount - 1
      }),
      style: style
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: titleClassName,
      role: "rowheader"
    }, year), /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('list')
    }, MONTHS_INDEX.map(month => {
      const yearMonth = {
        year,
        month: month + 1
      }; // TODO: Doma - Should we make a constant pool for optimization?
      return /*#__PURE__*/_react.default.createElement(_MonthDropdownItem.default, {
        key: (0, _plainDate.plainYearMonthToString)(yearMonth),
        yearMonth: yearMonth,
        disabled: isMonthDisabled === null || isMonthDisabled === void 0 ? void 0 : isMonthDisabled(yearMonth),
        active: isSelectedYear && month === selectedMonth
      });
    })));
  }, [Item, date, isMonthDisabled, merge, prefix, itemClassName, rowCount, startYear]);
  const classes = merge(className, withPrefix(), {
    show
  });
  const initialItemIndex = (0, _date.getYear)(date) - startYear;
  const initialScrollOffset = ITEM_SIZE * initialItemIndex;
  if (!show) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    role: "grid",
    tabIndex: -1,
    className: classes,
    "aria-labelledby": targetId ? `${targetId}-grid-label` : undefined,
    id: targetId ? `${targetId}-calendar-month-dropdown` : undefined,
    "data-testid": "calendar-month-dropdown"
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('scroll')
  }, /*#__PURE__*/_react.default.createElement(_Windowing.AutoSizer, {
    defaultHeight: defaultHeight,
    defaultWidth: defaultWidth
  }, ({
    height,
    width
  }) => /*#__PURE__*/_react.default.createElement(_Windowing.FixedSizeList, (0, _extends2.default)({
    className: merge(prefix('row-wrapper'), listClassName),
    width: width || defaultWidth,
    height: height || defaultHeight,
    itemSize: ITEM_SIZE,
    itemCount: rowCount,
    initialScrollOffset: initialScrollOffset,
    innerElementType: List
  }, restListProps), rowRenderer))));
});
MonthDropdown.displayName = 'MonthDropdown';
var _default = exports.default = MonthDropdown;