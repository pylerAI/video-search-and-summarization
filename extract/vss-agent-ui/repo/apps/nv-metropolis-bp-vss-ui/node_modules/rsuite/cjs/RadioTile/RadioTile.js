'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Check = _interopRequireDefault(require("@rsuite/icons/Check"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _RadioTileGroup = require("../RadioTileGroup/RadioTileGroup");
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * A series of selectable tile components that behave like Radio.
 * @version 5.35.0
 * @see https://rsuitejs.com/components/radio-tile/
 */
const RadioTile = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('RadioTile', props);
  const {
    value: groupValue,
    name: nameContext,
    disabled: disabledContext,
    onChange: onGroupChange
  } = (0, _react.useContext)(_RadioTileGroup.RadioTileContext);
  const {
    as = 'label',
    children,
    classPrefix = 'radio-tile',
    checked: checkedProp,
    className,
    defaultChecked,
    disabled = disabledContext,
    icon,
    value,
    label,
    name = nameContext,
    tabIndex = 0,
    onChange,
    ...rest
  } = propsWithDefaults;
  const [checked, setChecked] = (0, _hooks.useControlled)(typeof groupValue !== 'undefined' ? groupValue === value : checkedProp, defaultChecked || false);
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)(rest);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleChange = (0, _react.useCallback)(event => {
    setChecked(true);
    onGroupChange === null || onGroupChange === void 0 || onGroupChange(value, event);
    onChange === null || onChange === void 0 || onChange(value, event);
  }, [onChange, onGroupChange, setChecked, value]);
  const classes = merge(className, withPrefix());
  const radioId = (0, _hooks.useUniqueId)('radio-');
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-disabled": disabled,
    "data-checked": checked
  }, restProps), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('icon')
  }, icon), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('body')
  }, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, {
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    tabIndex: tabIndex,
    disabled: disabled,
    onChange: handleChange,
    "aria-checked": checked,
    "aria-disabled": disabled,
    "aria-labelledby": `${radioId}-label`,
    "aria-describedby": `${radioId}-desc`
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('label'),
    id: `${radioId}-label`
  }, label), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content'),
    id: `${radioId}-desc`
  }, children), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('mark')
  }, /*#__PURE__*/_react.default.createElement(_Check.default, {
    className: prefix('mark-icon')
  }))));
});
RadioTile.displayName = 'RadioTile';
var _default = exports.default = RadioTile;