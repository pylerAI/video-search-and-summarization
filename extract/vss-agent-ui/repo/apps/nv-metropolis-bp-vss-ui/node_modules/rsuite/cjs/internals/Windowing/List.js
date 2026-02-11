'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.defaultItemSize = exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ScrollView = _interopRequireDefault(require("../ScrollView"));
var _reactWindow = require("react-window");
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const defaultItemSize = () => 36;
exports.defaultItemSize = defaultItemSize;
const OuterElementType = (0, _utils.forwardRef)(function OuterElementType(props, ref) {
  return /*#__PURE__*/_react.default.createElement(_ScrollView.default, (0, _extends2.default)({
    scrollShadow: true,
    ref: ref
  }, props));
});

/**
 * This component renders a virtualized list of elements with either fixed or dynamic heights.
 *
 * @private
 */
const List = (0, _utils.forwardRef)((props, ref) => {
  const {
    rowHeight,
    as: Component = _reactWindow.VariableSizeList,
    itemSize: itemSizeProp,
    scrollShadow,
    ...rest
  } = props;
  const listRef = (0, _react.useRef)(null);
  const {
    rtl
  } = (0, _hooks.useCustom)();
  (0, _react.useImperativeHandle)(ref, () => ({
    resetAfterIndex: (index, shouldForceUpdate) => {
      var _listRef$current, _listRef$current$rese;
      (_listRef$current = listRef.current) === null || _listRef$current === void 0 || (_listRef$current$rese = _listRef$current.resetAfterIndex) === null || _listRef$current$rese === void 0 || _listRef$current$rese.call(_listRef$current, index, shouldForceUpdate);
    },
    scrollTo: scrollOffset => {
      var _listRef$current2, _listRef$current2$scr;
      (_listRef$current2 = listRef.current) === null || _listRef$current2 === void 0 || (_listRef$current2$scr = _listRef$current2.scrollTo) === null || _listRef$current2$scr === void 0 || _listRef$current2$scr.call(_listRef$current2, scrollOffset);
    },
    scrollToItem: (index, align) => {
      var _listRef$current3, _listRef$current3$scr;
      (_listRef$current3 = listRef.current) === null || _listRef$current3 === void 0 || (_listRef$current3$scr = _listRef$current3.scrollToItem) === null || _listRef$current3$scr === void 0 || _listRef$current3$scr.call(_listRef$current3, index, align);
    },
    scrollToRow: index => {
      var _listRef$current4, _listRef$current4$scr;
      (_listRef$current4 = listRef.current) === null || _listRef$current4 === void 0 || (_listRef$current4$scr = _listRef$current4.scrollToItem) === null || _listRef$current4$scr === void 0 || _listRef$current4$scr.call(_listRef$current4, index);
    }
  }));
  const setRowHeight = (0, _react.useCallback)(index => {
    return typeof rowHeight === 'function' ? rowHeight({
      index
    }) : rowHeight || 0;
  }, [rowHeight]);
  const itemSize = (0, _react.useMemo)(() => {
    if (typeof itemSizeProp === 'function') return itemSizeProp;
    return () => itemSizeProp;
  }, [itemSizeProp]);
  const compatibleProps = {
    itemSize,
    ...rest
  };
  if (rowHeight) {
    compatibleProps.itemSize = Component === _reactWindow.VariableSizeList ? setRowHeight : rowHeight;
  }
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: listRef,
    direction: rtl ? 'rtl' : 'ltr'
  }, compatibleProps, {
    outerElementType: scrollShadow ? OuterElementType : undefined
  }));
});
List.displayName = 'List';
var _default = exports.default = List;