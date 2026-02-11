'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const ModalDialog = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    style,
    children,
    dialogClassName,
    dialogStyle,
    classPrefix = 'modal',
    className,
    size,
    ...rest
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix(size));
  const dialogClasses = merge(dialogClassName, prefix('dialog'));
  const modalStyle = (0, _utils.mergeStyles)({
    display: 'block'
  }, style);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "dialog",
    "aria-modal": true,
    ref: ref,
    className: classes,
    style: modalStyle
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    role: "document",
    className: dialogClasses,
    style: dialogStyle
  }, children));
});
ModalDialog.displayName = 'ModalDialog';
var _default = exports.default = ModalDialog;