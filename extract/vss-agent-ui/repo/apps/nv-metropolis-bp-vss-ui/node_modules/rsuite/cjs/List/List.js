'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _useSortHelper = _interopRequireDefault(require("./helper/useSortHelper"));
var _ListContext = _interopRequireDefault(require("./ListContext"));
var _ListItem = _interopRequireDefault(require("./ListItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _ListItem.default
};

/**
 * The `List` component is used to specify the layout of the list.
 * @see https://rsuitejs.com/components/list
 */
const List = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('List', props);
  const {
    as,
    autoScroll = true,
    bordered,
    classPrefix = 'list',
    className,
    children,
    divider = true,
    hover,
    size = 'md',
    sortable,
    pressDelay = 0,
    transitionDuration = 300,
    onSort,
    onSortEnd,
    onSortMove,
    onSortStart,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    containerRef,
    register,
    sorting,
    handleEnd,
    handleStart,
    handleTouchStart,
    handleTouchEnd
  } = (0, _useSortHelper.default)({
    autoScroll,
    onSort,
    onSortEnd,
    onSortMove,
    onSortStart,
    pressDelay,
    transitionDuration
  });
  const classes = merge(className, withPrefix());
  const contextValue = (0, _react.useMemo)(() => ({
    bordered,
    size,
    register
  }), [bordered, register, size]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "list",
    ref: (0, _utils.mergeRefs)(containerRef, ref),
    className: classes,
    onMouseDown: sortable ? handleStart : undefined,
    onMouseUp: sortable ? handleEnd : undefined,
    onTouchStart: sortable ? handleTouchStart : undefined,
    onTouchEnd: sortable ? handleTouchEnd : undefined,
    "data-bordered": bordered,
    "data-hover": hover,
    "data-sortable": sortable,
    "data-sorting": sorting,
    "data-divider": divider
  }, rest), /*#__PURE__*/_react.default.createElement(_ListContext.default.Provider, {
    value: contextValue
  }, children));
}, Subcomponents);
List.displayName = 'List';
var _default = exports.default = List;