'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _SegmentedItem = _interopRequireDefault(require("./SegmentedItem"));
var _Indicator = _interopRequireDefault(require("./Indicator"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _useIndicatorPosition = _interopRequireDefault(require("./hooks/useIndicatorPosition"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `SegmentedControl` component is used to offer multiple exclusive options.
 * @see https://rsuitejs.com/components/segmented-control
 */
const SegmentedControl = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('SegmentedControl', props);
  const {
    as,
    className,
    classPrefix = 'segmented-control',
    value: valueProp,
    defaultValue,
    indicator = 'pill',
    size = 'md',
    block = false,
    name,
    disabled,
    data,
    onChange,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const id = (0, _hooks.useUniqueId)('segmented', name);

  // Ref for container element
  const containerRef = (0, _react.useRef)(null);

  // Get the active item index
  const activeIndex = data === null || data === void 0 ? void 0 : data.findIndex(item => item.value === value);
  const {
    style: indicatorStyle
  } = (0, _useIndicatorPosition.default)({
    containerRef,
    activeIndex,
    indicator,
    data
  });
  const handleChange = (0, _hooks.useEventCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue !== null && nextValue !== void 0 ? nextValue : '', event);
  });
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "radiogroup",
    ref: (0, _utils.mergeRefs)(ref, containerRef),
    className: classes,
    "data-size": size,
    "data-block": block || undefined,
    "data-indicator": indicator
  }, rest), data === null || data === void 0 ? void 0 : data.map((item, index) => /*#__PURE__*/_react.default.createElement(_SegmentedItem.default, {
    key: index,
    item: item,
    index: index,
    name: id,
    active: value === item.value,
    disabled: disabled,
    classPrefix: classPrefix,
    onChange: handleChange
  })), activeIndex !== -1 && /*#__PURE__*/_react.default.createElement(_Indicator.default, {
    style: indicatorStyle,
    classPrefix: classPrefix
  }));
});
SegmentedControl.displayName = 'SegmentedControl';
var _default = exports.default = SegmentedControl;