'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Modal = _interopRequireDefault(require("../Modal"));
var _Button = _interopRequireDefault(require("../Button"));
var _Input = _interopRequireDefault(require("../Input"));
var _Text = _interopRequireDefault(require("../Text"));
var _utils = require("../internals/utils");
var _Stack = require("../Stack");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const severityMap = {
  info: 'blue',
  success: 'green',
  warning: 'orange',
  error: 'red'
};
const Dialog = (0, _utils.forwardRef)((props, ref) => {
  const {
    getLocale,
    propsWithDefaults
  } = (0, _hooks.useCustom)('Dialog', props);
  const locale = getLocale('Dialog');
  const {
    type,
    title = type === 'alert' ? locale.alert : locale.confirm,
    content,
    okText = locale.ok,
    cancelText = locale.cancel,
    severity,
    defaultValue = '',
    validate,
    onClose,
    ...rest
  } = propsWithDefaults;
  const [isOpen, setIsOpen] = (0, _react.useState)(true);
  const [validationError, setValidationError] = (0, _react.useState)();
  const inputRef = (0, _react.useRef)(null);
  const inputValue = (0, _react.useRef)(defaultValue);
  const showCancelButton = type === 'confirm' || type === 'prompt';
  (0, _react.useEffect)(() => {
    if (type === 'prompt' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [type]);
  const handleCancel = (0, _react.useCallback)(result => {
    setIsOpen(false);
    setTimeout(() => {
      onClose === null || onClose === void 0 || onClose(result);
    }, 300);
  }, [onClose]);
  const handleConfirm = (0, _react.useCallback)(() => {
    if (type === 'prompt') {
      const value = inputValue.current;
      if (validate) {
        const [isValid, errorMessage] = validate(value);
        if (!isValid) {
          setValidationError(errorMessage || 'Invalid input');
          return;
        }
      }
      handleCancel(value);
    } else {
      handleCancel(true);
    }
  }, [type, inputValue, validate, handleCancel]);
  const handleClose = (0, _react.useCallback)(() => handleCancel(false), [handleCancel]);
  const handleInputKeyDown = (0, _react.useCallback)(event => {
    if (event.key === 'Enter') {
      handleConfirm();
    }
  }, [handleConfirm]);
  const handlePromptInputChange = (0, _react.useCallback)(value => {
    inputValue.current = value;
    if (validationError) setValidationError(undefined);
  }, [validationError]);
  return /*#__PURE__*/_react.default.createElement(_Modal.default, (0, _extends2.default)({
    ref: ref,
    open: isOpen,
    size: "xs",
    backdrop: "static"
  }, rest), /*#__PURE__*/_react.default.createElement(_Modal.default.Header, {
    closeButton: false
  }, /*#__PURE__*/_react.default.createElement(_Modal.default.Title, null, title)), /*#__PURE__*/_react.default.createElement(_Modal.default.Body, null, /*#__PURE__*/_react.default.createElement(_Stack.VStack, null, type === 'prompt' ? /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("label", {
    htmlFor: "rs-prompt-input"
  }, content), /*#__PURE__*/_react.default.createElement(_Input.default, {
    w: "100%",
    required: true,
    ref: inputRef,
    id: "rs-prompt-input",
    defaultValue: defaultValue,
    onChange: handlePromptInputChange,
    onKeyDown: handleInputKeyDown
  }), validationError && /*#__PURE__*/_react.default.createElement(_Text.default, {
    color: "red"
  }, validationError)) : content)), /*#__PURE__*/_react.default.createElement(_Modal.default.Footer, null, showCancelButton && /*#__PURE__*/_react.default.createElement(_Button.default, {
    onClick: handleClose,
    appearance: "subtle"
  }, cancelText), /*#__PURE__*/_react.default.createElement(_Button.default, {
    appearance: "primary",
    onClick: handleConfirm,
    color: severity ? severityMap[severity] : undefined
  }, okText)));
});
var _default = exports.default = Dialog;