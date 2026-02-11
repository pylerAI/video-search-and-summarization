'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../internals/hooks");
var _Button = _interopRequireDefault(require("../Button"));
/**
 * The `InputGroup.Button` component is used to specify an input field with an add-on.
 * @see https://rsuitejs.com/components/input/#input-group
 */
const InputGroupButton = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    classPrefix = 'input-group-btn',
    className,
    ...rest
  } = props;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Button.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    className: classes
  }));
});
InputGroupButton.displayName = 'InputGroupButton';
var _default = exports.default = InputGroupButton;