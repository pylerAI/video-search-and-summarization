'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _hooks = require("../hooks");
var _ArrowDown = _interopRequireDefault(require("@rsuite/icons/ArrowDown"));
const ListItemGroup = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    as: Component = 'div',
    classPrefix = 'dropdown-menu-group',
    children,
    className,
    ...rest
  } = props;
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "group"
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`title`,
    tabIndex: -1
  }, /*#__PURE__*/_react.default.createElement("span", null, children), /*#__PURE__*/_react.default.createElement(_ArrowDown.default, {
    "aria-hidden": true,
    className: prefix`caret`
  })));
});
ListItemGroup.displayName = 'ListItemGroup';
var _default = exports.default = ListItemGroup;