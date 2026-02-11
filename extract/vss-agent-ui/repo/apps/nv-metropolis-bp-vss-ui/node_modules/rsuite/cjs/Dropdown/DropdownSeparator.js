'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * The `<Dropdown.Separator>` API
 *
 * Renders a non-focusable and non-interactive `separator`
 * Per ARIA APG https://www.w3.org/WAI/ARIA/apg/patterns/menu/
 */
const DropdownSeparator = (0, _utils.forwardRef)((props, ref) => {
  const {
    classPrefix = 'dropdown-item-divider',
    className,
    as: Component = 'li',
    ...restProps
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    role: "separator",
    className: merge(withPrefix(), className)
  }, restProps));
});
DropdownSeparator.displayName = 'Dropdown.Separator';
var _default = exports.default = DropdownSeparator;