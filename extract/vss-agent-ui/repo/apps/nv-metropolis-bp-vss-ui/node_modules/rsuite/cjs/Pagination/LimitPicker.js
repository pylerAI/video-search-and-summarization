'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _SelectPicker = _interopRequireDefault(require("../SelectPicker"));
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const LimitPicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    disabled,
    limitOptions,
    locale,
    limit,
    onChangeLimit,
    size,
    prefix,
    ...rest
  } = props;
  const containerRef = (0, _react.useRef)(null);
  const disabledPicker = typeof disabled === 'function' ? disabled('picker') : Boolean(disabled);
  const formatlimitOptions = limitOptions.map(item => {
    return {
      value: item,
      label: locale.limit && (0, _utils.tplTransform)(locale.limit, item)
    };
  });
  return /*#__PURE__*/_react.default.createElement(Component, {
    className: prefix('limit'),
    ref: (0, _utils.mergeRefs)(containerRef, ref)
  }, /*#__PURE__*/_react.default.createElement(_SelectPicker.default, (0, _extends2.default)({}, rest, {
    size: size,
    cleanable: false,
    searchable: false,
    placement: "topStart",
    data: formatlimitOptions,
    value: limit,
    onChange: onChangeLimit,
    popupStyle: {
      minWidth: 'auto'
    },
    disabled: disabledPicker,
    container: () => containerRef.current
  })));
});
var _default = exports.default = LimitPicker;