'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../Box"));
var _utils = require("../utils");
var _hooks = require("../hooks");
/**
 * Make the component display in plain text, and display default characters when there is no children.
 * @private
 */
const Plaintext = (0, _utils.forwardRef)((props, ref) => {
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const {
    as,
    classPrefix = 'plaintext',
    className,
    children,
    localeKey = '',
    placeholder = getLocale('Plaintext')[localeKey] || '',
    ...rest
  } = props;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    empty: !children
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "text"
  }, rest, {
    ref: ref,
    className: classes
  }), children ? children : placeholder);
});
Plaintext.displayName = 'Plaintext';
var _default = exports.default = Plaintext;