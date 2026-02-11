'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `<Menu.Separator>` API
 *
 */
const MenuSeparator = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'li',
    classPrefix = 'menu-item-divider',
    className,
    ...rest
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    role: "separator",
    className: merge(withPrefix(), className)
  }, rest));
});
MenuSeparator.displayName = 'MenuSeparator';
var _default = exports.default = MenuSeparator;