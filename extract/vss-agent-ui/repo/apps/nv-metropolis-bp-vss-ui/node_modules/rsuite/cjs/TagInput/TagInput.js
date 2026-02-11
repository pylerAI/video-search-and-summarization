'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _InputPicker = _interopRequireDefault(require("../InputPicker/InputPicker"));
var _utils = require("../internals/utils");
var _InputPickerContext = require("../InputPicker/InputPickerContext");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `TagInput` component is an enhancement of Input and supports input tags and management tags.
 *
 * @see https://rsuitejs.com/components/tag-input
 */
const TagInput = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('TagInput', props);
  const {
    tagProps = {},
    trigger = 'Enter',
    value,
    defaultValue,
    onTagRemove,
    ...rest
  } = propsWithDefaults;
  const contextValue = (0, _react.useMemo)(() => ({
    multi: true,
    disabledOptions: true,
    trigger,
    tagProps,
    onTagRemove
  }), [onTagRemove, tagProps, trigger]);
  const data = (0, _react.useMemo)(() => (value || defaultValue || []).map(v => ({
    value: v,
    label: v
  })), [defaultValue, value]);
  return /*#__PURE__*/_react.default.createElement(_InputPickerContext.TagProvider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_InputPicker.default, (0, _extends2.default)({}, rest, {
    "aria-haspopup": false,
    "aria-expanded": undefined,
    "aria-controls": undefined,
    "aria-keyshortcuts": trigger,
    value: value,
    defaultValue: defaultValue,
    data: data,
    placement: undefined,
    creatable: true,
    ref: ref
  })));
});
TagInput.displayName = 'TagInput';
var _default = exports.default = TagInput;