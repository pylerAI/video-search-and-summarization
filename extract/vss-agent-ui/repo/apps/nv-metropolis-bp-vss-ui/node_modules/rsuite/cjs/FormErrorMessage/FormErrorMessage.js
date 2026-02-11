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
/**
 * The `<Form.ErrorMessage>` component is used to display error messages in the form.
 * @see https://rsuitejs.com/components/form/
 */
const FormErrorMessage = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('FormErrorMessage', props);
  const {
    as,
    classPrefix = 'form-error-message',
    className,
    show,
    children,
    placement,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = withPrefix('show');
  const wrapperClasses = merge(className, prefix('wrapper'));
  return show ? /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    "data-placement": (0, _utils.kebabPlace)(placement),
    className: wrapperClasses
  }, rest), /*#__PURE__*/_react.default.createElement("span", {
    className: classes
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`arrow`
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`inner`
  }, children))) : null;
});
FormErrorMessage.displayName = 'FormErrorMessage';
var _default = exports.default = FormErrorMessage;