'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Input = _interopRequireDefault(require("../Input"));
var _InputGroup = _interopRequireDefault(require("../InputGroup"));
var _EyeClose = _interopRequireDefault(require("@rsuite/icons/EyeClose"));
var _Visible = _interopRequireDefault(require("@rsuite/icons/Visible"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const PasswordInput = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('PasswordInput', props);
  const {
    classPrefix = 'password-input',
    className,
    visible: controlVisible,
    size,
    defaultVisible,
    value,
    defaultValue,
    placeholder,
    id,
    name,
    readOnly,
    inputRef,
    startIcon,
    endIcon,
    onChange,
    onVisibleChange,
    renderVisibilityIcon,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const [visible, setVisible] = (0, _hooks.useControlled)(controlVisible, defaultVisible);
  const classes = merge(className, withPrefix());
  const handleToggleVisibility = (0, _hooks.useEventCallback)(() => {
    setVisible(!visible);
    onVisibleChange === null || onVisibleChange === void 0 || onVisibleChange(!visible);
  });
  return /*#__PURE__*/_react.default.createElement(_InputGroup.default, (0, _extends2.default)({
    inside: true,
    ref: ref,
    size: size,
    className: classes
  }, rest), startIcon && /*#__PURE__*/_react.default.createElement(_InputGroup.default.Addon, null, startIcon), /*#__PURE__*/_react.default.createElement(_Input.default, {
    type: visible ? 'text' : 'password',
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    autoComplete: "off",
    placeholder: placeholder,
    readOnly: readOnly,
    name: name,
    id: id,
    inputRef: inputRef
  }), endIcon ? /*#__PURE__*/_react.default.createElement(_InputGroup.default.Addon, null, endIcon) : /*#__PURE__*/_react.default.createElement(_InputGroup.default.Button, {
    tabIndex: -1,
    onClick: handleToggleVisibility,
    "aria-label": "Toggle password visibility"
  }, (renderVisibilityIcon === null || renderVisibilityIcon === void 0 ? void 0 : renderVisibilityIcon(visible !== null && visible !== void 0 ? visible : false)) || (visible ? /*#__PURE__*/_react.default.createElement(_EyeClose.default, null) : /*#__PURE__*/_react.default.createElement(_Visible.default, null))));
});
PasswordInput.displayName = 'PasswordInput';
var _default = exports.default = PasswordInput;