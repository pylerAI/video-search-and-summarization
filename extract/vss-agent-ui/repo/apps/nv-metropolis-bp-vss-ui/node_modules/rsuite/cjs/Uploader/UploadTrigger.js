'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _Button = _interopRequireDefault(require("../Button"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _classnames = _interopRequireDefault(require("classnames"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const UploadTrigger = (0, _utils.forwardRef)((props, ref) => {
  var _children$props;
  const {
    as: Component = _Button.default,
    name,
    accept,
    multiple,
    disabled,
    readOnly,
    children,
    classPrefix = 'uploader-trigger',
    className,
    draggable,
    locale,
    onChange,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    ...rest
  } = props;
  const rootRef = (0, _react.useRef)(null);
  const [dragOver, setDragOver] = (0, _react.useState)(false);
  const inputRef = (0, _react.useRef)(null);
  const {
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = (0, _classnames.default)(className, withPrefix({
    customize: children,
    'drag-over': dragOver
  }));
  const handleClick = (0, _hooks.useEventCallback)(() => {
    var _inputRef$current;
    (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 || _inputRef$current.click();
  });
  const handleClearInput = (0, _hooks.useEventCallback)(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  });
  const handleDragEnter = (0, _hooks.useEventCallback)(event => {
    if (draggable) {
      event.preventDefault();
      setDragOver(true);
    }
    onDragEnter === null || onDragEnter === void 0 || onDragEnter(event);
  });
  const handleDragLeave = (0, _hooks.useEventCallback)(event => {
    if (draggable) {
      event.preventDefault();
      setDragOver(false);
    }
    onDragLeave === null || onDragLeave === void 0 || onDragLeave(event);
  });
  const handleDragOver = (0, _hooks.useEventCallback)(event => {
    draggable && event.preventDefault();
    onDragOver === null || onDragOver === void 0 || onDragOver(event);
  });
  const handleDrop = (0, _hooks.useEventCallback)(event => {
    if (draggable) {
      event.preventDefault();
      setDragOver(false);
      onChange === null || onChange === void 0 || onChange(event);
    }
    onDrop === null || onDrop === void 0 || onDrop(event);
  });
  (0, _react.useImperativeHandle)(ref, () => ({
    root: rootRef.current,
    clearInput: handleClearInput
  }));

  // Prepare button props with event handlers conditionally applied
  const buttonProps = {
    ...rest,
    disabled,
    className: prefix('btn'),
    // Only add event handlers if component is interactive
    ...(!disabled && !readOnly && {
      onClick: handleClick,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    })
  };
  const trigger = children ? (/*#__PURE__*/_react.default.cloneElement(children, {
    ...buttonProps,
    className: (0, _classnames.default)((_children$props = children.props) === null || _children$props === void 0 ? void 0 : _children$props.className, prefix('btn'))
  })) : /*#__PURE__*/_react.default.createElement(Component, buttonProps, locale === null || locale === void 0 ? void 0 : locale.upload);
  return /*#__PURE__*/_react.default.createElement("div", {
    ref: rootRef,
    className: classes,
    "data-disabled": disabled
  }, /*#__PURE__*/_react.default.createElement("input", {
    type: "file",
    name: name,
    multiple: multiple,
    disabled: disabled,
    readOnly: readOnly,
    accept: accept,
    ref: inputRef,
    onChange: onChange
  }), trigger);
});
UploadTrigger.displayName = 'UploadTrigger';
var _default = exports.default = UploadTrigger;