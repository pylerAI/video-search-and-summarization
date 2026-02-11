'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.triggerPropKeys = exports.pickerCommonPropKeys = exports.overlayPropKeys = exports.default = exports.PickerToggleTrigger = exports.ComboboxContext = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Box = _interopRequireDefault(require("../Box"));
var _PickerDrawer = _interopRequireDefault(require("./PickerDrawer"));
var _OverlayTrigger = _interopRequireDefault(require("../Overlay/OverlayTrigger"));
var _hooks = require("../hooks");
var _useBreakpointValue = require("../../useBreakpointValue");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const overlayPropKeys = exports.overlayPropKeys = ['onEntered', 'onExited', 'onEnter', 'onEntering', 'onExit', 'onExiting', 'open', 'onOpen', 'defaultOpen', 'onClose', 'container', 'containerPadding', 'preventOverflow'];
const pickerCommonPropKeys = exports.pickerCommonPropKeys = ['disabled', 'plaintext', 'readOnly', 'loading', 'label'];
const triggerPropKeys = exports.triggerPropKeys = [...overlayPropKeys, ...pickerCommonPropKeys];
const ComboboxContext = exports.ComboboxContext = /*#__PURE__*/_react.default.createContext({
  popupType: 'listbox'
});
const PickerToggleTrigger = exports.PickerToggleTrigger = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    appearance,
    as,
    block,
    children,
    className,
    classPrefix = 'picker',
    disabled,
    id,
    multiple,
    name,
    pickerType,
    triggerProps,
    placement,
    popupType = 'listbox',
    rootRef,
    speaker,
    style,
    size,
    trigger = 'click',
    responsive = true,
    onKeyDown,
    onClick,
    ...rest
  } = props;
  const pickerTriggerProps = (0, _pick.default)(triggerProps, triggerPropKeys);
  const pickerId = (0, _hooks.useUniqueId)('rs-', id);
  const breakpoint = (0, _useBreakpointValue.useBreakpointValue)({
    xsOnly: 'xs'
  }, {
    enabled: responsive
  });
  // Only use the breakpoint value if not disabled
  const effectiveBreakpoint = disabled ? undefined : breakpoint;
  const comboboxContext = (0, _react.useMemo)(() => ({
    id: pickerId,
    hasLabel: typeof pickerTriggerProps.label !== 'undefined',
    multiple,
    placement,
    breakpoint: effectiveBreakpoint,
    popupType
  }), [pickerId, multiple, placement, effectiveBreakpoint, popupType]);
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(ComboboxContext.Provider, {
    value: comboboxContext
  }, /*#__PURE__*/_react.default.createElement(_OverlayTrigger.default, (0, _extends2.default)({}, pickerTriggerProps, {
    disabled: pickerTriggerProps.disabled || pickerTriggerProps.loading,
    ref: ref,
    trigger: trigger,
    placement: placement,
    speaker: speaker,
    overlayAs: effectiveBreakpoint === 'xs' ? _PickerDrawer.default : undefined
  }), /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    className: classes,
    style: style,
    ref: rootRef,
    name: name,
    "data-picker": pickerType,
    "data-appearance": appearance,
    "data-size": size,
    "data-disabled": disabled || undefined,
    "data-block": block || undefined,
    "data-testid": "picker",
    onKeyDown: onKeyDown,
    onClick: onClick
  }, (0, _omit.default)(rest, [...triggerPropKeys])), children)));
});
PickerToggleTrigger.displayName = 'PickerToggleTrigger';
var _default = exports.default = PickerToggleTrigger;