'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Plaintext = _interopRequireDefault(require("../Plaintext"));
var _Box = _interopRequireDefault(require("../Box"));
var _utils = require("../utils");
var _FormGroup = require("../../FormGroup");
var _InputGroup = require("../../InputGroup");
var _constants = require("../constants");
var _hooks = require("../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `InputBase` component serves as the base for both Input and Textarea components.
 * It provides common functionality for both components.
 */
const InputBase = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    className,
    classPrefix,
    disabled,
    value,
    defaultValue,
    inputRef,
    id,
    size,
    plaintext,
    placeholder,
    readOnly,
    inputProps,
    onPressEnter,
    onFocus,
    onBlur,
    onKeyDown,
    onChange,
    ...rest
  } = props;
  const inputGroup = (0, _react.useContext)(_InputGroup.InputGroupContext);
  const {
    controlId
  } = (0, _FormGroup.useFormGroup)();
  const handleKeyDown = event => {
    if (event.key === _constants.KEY_VALUES.ENTER) {
      onPressEnter === null || onPressEnter === void 0 || onPressEnter(event);
    }
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(event);
  };
  const handleChange = event => {
    var _event$target;
    onChange === null || onChange === void 0 || onChange((_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.value, event);
  };
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix || 'input');
  const classes = merge(className, withPrefix({
    plaintext
  }));

  // Make the component display in plain text,
  // and display default characters when there is no value.
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      ref: ref,
      localeKey: "unfilled",
      placeholder: placeholder
    }, typeof value === 'undefined' ? defaultValue : value);
  }
  const inputable = !disabled && !readOnly;
  const eventProps = {};
  if (inputable) {
    eventProps.onChange = handleChange;
    eventProps.onKeyDown = handleKeyDown;
    eventProps.onFocus = (0, _utils.createChainedFunction)(onFocus, inputGroup === null || inputGroup === void 0 ? void 0 : inputGroup.onFocus);
    eventProps.onBlur = (0, _utils.createChainedFunction)(onBlur, inputGroup === null || inputGroup === void 0 ? void 0 : inputGroup.onBlur);
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: (0, _utils.mergeRefs)(ref, inputRef),
    className: classes,
    id: id || controlId,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    readOnly: readOnly,
    placeholder: placeholder,
    "data-size": size
  }, inputProps, eventProps, rest));
});
InputBase.displayName = 'InputBase';
var _default = exports.default = InputBase;