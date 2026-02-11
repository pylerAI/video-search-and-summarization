'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _Icon = _interopRequireDefault(require("@rsuite/icons/Icon"));
var _InputGroup = _interopRequireDefault(require("../../InputGroup"));
var _CloseButton = _interopRequireDefault(require("../CloseButton"));
var _Loader = _interopRequireDefault(require("../../Loader"));
var _hooks = require("../hooks");
const PickerIndicator = ({
  loading,
  caretAs,
  onClose,
  showCleanButton,
  as: Component = _InputGroup.default.Addon,
  disabled,
  size
}) => {
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const {
    clear
  } = getLocale('common');
  const {
    prefix
  } = (0, _hooks.useStyles)('picker');
  const addon = () => {
    if (loading) {
      return /*#__PURE__*/_react.default.createElement(_Loader.default, {
        className: prefix('loader'),
        "data-testid": "spinner",
        size: size === 'xs' ? 'xs' : 'sm'
      });
    }
    if (showCleanButton && !disabled) {
      return /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
        className: prefix('clean'),
        tabIndex: -1,
        locale: {
          closeLabel: clear
        },
        onClick: onClose
      });
    }
    return caretAs && /*#__PURE__*/_react.default.createElement(_Icon.default, {
      as: caretAs,
      className: prefix('caret-icon'),
      "data-testid": "caret"
    });
  };
  const props = Component === _InputGroup.default.Addon ? {
    disabled
  } : undefined;
  return /*#__PURE__*/_react.default.createElement(Component, props, addon());
};
var _default = exports.default = PickerIndicator;