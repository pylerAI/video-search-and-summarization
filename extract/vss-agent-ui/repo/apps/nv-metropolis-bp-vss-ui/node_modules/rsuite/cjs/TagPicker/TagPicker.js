'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _InputPicker = _interopRequireDefault(require("../InputPicker/InputPicker"));
var _InputPickerContext = require("../InputPicker/InputPickerContext");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * `TagPicker` component enables multi-selection by tags and supports new options.
 *
 * @see https://rsuitejs.com/components/tag-picker/
 */
const TagPicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('TagPicker', props);
  const {
    tagProps = {},
    trigger = 'Enter',
    size = 'md',
    onTagRemove,
    renderCheckbox,
    renderValue,
    ...rest
  } = propsWithDefaults;
  const contextValue = (0, _react.useMemo)(() => ({
    multi: true,
    trigger,
    tagProps,
    onTagRemove,
    renderCheckbox
  }), [onTagRemove, renderCheckbox, tagProps, trigger]);
  return /*#__PURE__*/_react.default.createElement(_InputPickerContext.TagProvider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_InputPicker.default, (0, _extends2.default)({
    size: size,
    renderValue: renderValue
  }, rest, {
    ref: ref
  })));
});
TagPicker.displayName = 'TagPicker';
var _default = exports.default = TagPicker;