'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _HelpOutline = _interopRequireDefault(require("@rsuite/icons/HelpOutline"));
var _Tooltip = _interopRequireDefault(require("../Tooltip"));
var _Whisper = _interopRequireDefault(require("../Whisper"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _FormGroup = require("../FormGroup");
/**
 * The `<Form.HelpText>` component is used to display help information in the form.
 * @see https://rsuitejs.com/components/form/
 */
const FormHelpText = (0, _utils.forwardRef)((props, ref) => {
  const {
    helpTextId
  } = (0, _FormGroup.useFormGroup)();
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('FormHelpText', props);
  const {
    as = 'span',
    classPrefix = 'form-help-text',
    className,
    tooltip,
    children,
    id = helpTextId,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    tooltip
  }));
  if (tooltip) {
    return /*#__PURE__*/_react.default.createElement(_Whisper.default, {
      ref: ref,
      placement: "topEnd",
      speaker: /*#__PURE__*/_react.default.createElement(_Tooltip.default, (0, _extends2.default)({
        id: id
      }, rest), children)
    }, /*#__PURE__*/_react.default.createElement(_Box.default, {
      as: as,
      role: "img",
      "aria-label": "help",
      className: classes
    }, /*#__PURE__*/_react.default.createElement(_HelpOutline.default, {
      "aria-hidden": true
    })));
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    id: id
  }, rest, {
    ref: ref,
    className: classes
  }), children);
});
FormHelpText.displayName = 'FormHelpText';
var _default = exports.default = FormHelpText;