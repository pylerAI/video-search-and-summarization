'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _omit2 = _interopRequireDefault(require("lodash/omit"));
var _react = _interopRequireWildcard(require("react"));
var _ToggleButton = _interopRequireDefault(require("./ToggleButton"));
var _PickerIndicator = _interopRequireDefault(require("./PickerIndicator"));
var _PickerLabel = _interopRequireDefault(require("./PickerLabel"));
var _Plaintext = _interopRequireDefault(require("../Plaintext"));
var _Stack = _interopRequireDefault(require("../../Stack"));
var _useCombobox = _interopRequireDefault(require("./hooks/useCombobox"));
var _hooks = require("../hooks");
var _utils = require("../utils");
var _PickerToggleTrigger = require("./PickerToggleTrigger");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const PickerToggle = (0, _utils.forwardRef)((props, ref) => {
  const {
    active,
    as: Component = _ToggleButton.default,
    classPrefix = 'picker-toggle',
    children,
    caret = true,
    className,
    disabled,
    readOnly,
    plaintext,
    hasValue,
    loading = false,
    cleanable,
    countable,
    tabIndex = 0,
    inputValue: inputValueProp,
    focusItemValue,
    placement = 'bottomStart',
    caretComponent,
    caretAs = caretComponent,
    label,
    name,
    size,
    onClean,
    ...rest
  } = props;
  const combobox = (0, _react.useRef)(null);
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    id,
    labelId,
    popupType
  } = (0, _useCombobox.default)();
  const inputValue = (0, _react.useMemo)(() => {
    if (typeof inputValueProp === 'number' || typeof inputValueProp === 'string') {
      return inputValueProp;
    } else if (Array.isArray(inputValueProp)) {
      return inputValueProp.join(',');
    }
    return '';
  }, [inputValueProp]);
  const classes = merge(className, withPrefix());
  const handleClean = (0, _hooks.useEventCallback)(event => {
    var _combobox$current;
    event.stopPropagation();
    onClean === null || onClean === void 0 || onClean(event);
    (_combobox$current = combobox.current) === null || _combobox$current === void 0 || _combobox$current.focus();
  });
  const ToggleCaret = (0, _hooks.useToggleCaret)(placement);
  const Caret = caretAs !== null && caretAs !== void 0 ? caretAs : ToggleCaret;
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      ref: ref,
      localeKey: "notSelected"
    }, hasValue ? children : null);
  }
  const showCleanButton = cleanable && hasValue && !readOnly;
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "combobox",
    id: id,
    size: size,
    "aria-haspopup": popupType,
    "aria-expanded": active,
    "aria-disabled": disabled,
    "aria-controls": id ? `${id}-${popupType}` : undefined,
    "aria-labelledby": labelId,
    "aria-describedby": id ? `${id}-describe` : undefined,
    "aria-activedescendant": active && focusItemValue ? `${id}-opt-${focusItemValue}` : undefined,
    "data-has-value": hasValue,
    "data-cleanable": cleanable,
    "data-countable": countable,
    "data-size": size,
    "data-readonly": readOnly,
    "data-active": active,
    ref: (0, _utils.mergeRefs)(combobox, ref),
    disabled: disabled,
    tabIndex: disabled ? undefined : tabIndex,
    className: classes
  }, (0, _omit2.default)(rest, _PickerToggleTrigger.triggerPropKeys)), /*#__PURE__*/_react.default.createElement(_Stack.default, {
    className: prefix('stack')
  }, label && /*#__PURE__*/_react.default.createElement(_Stack.default.Item, null, /*#__PURE__*/_react.default.createElement(_PickerLabel.default, {
    as: "span",
    className: prefix('label'),
    id: labelId
  }, label)), /*#__PURE__*/_react.default.createElement(_Stack.default.Item, {
    grow: 1,
    overflow: "hidden"
  }, /*#__PURE__*/_react.default.createElement("input", {
    readOnly: true,
    "aria-hidden": true,
    tabIndex: -1,
    "data-testid": "picker-toggle-input",
    name: name,
    value: inputValue,
    className: prefix('textbox'),
    style: {
      pointerEvents: 'none'
    }
  }), children ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix(hasValue ? 'value' : 'placeholder'),
    id: `${id}-describe`,
    "data-testid": "picker-describe"
  }, children) : null), /*#__PURE__*/_react.default.createElement(_Stack.default.Item, {
    className: prefix`indicator`
  }, /*#__PURE__*/_react.default.createElement(_PickerIndicator.default, {
    size: size,
    as: _react.default.Fragment,
    loading: loading,
    caretAs: caret ? Caret : null,
    onClose: handleClean,
    showCleanButton: showCleanButton
  }))));
});
PickerToggle.displayName = 'PickerToggle';
var _default = exports.default = PickerToggle;