'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Icon = _interopRequireDefault(require("@rsuite/icons/Icon"));
var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));
var _hooks = require("../internals/hooks");
const AccordionButton = props => {
  const {
    classPrefix = 'panel-btn',
    expanded,
    id,
    className,
    controlId,
    children,
    disabled,
    caretAs = _ArrowDownLine.default,
    ...rest
  } = props;
  const {
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  return /*#__PURE__*/_react.default.createElement("button", (0, _extends2.default)({
    id: id,
    type: "button",
    "aria-controls": controlId,
    "aria-expanded": expanded,
    "aria-disabled": disabled,
    className: withPrefix(className),
    disabled: disabled
  }, rest), children, /*#__PURE__*/_react.default.createElement(_Icon.default, {
    as: caretAs,
    "aria-hidden": "true",
    className: prefix`icon`,
    "data-testid": "caret icon"
  }));
};
var _default = exports.default = AccordionButton;