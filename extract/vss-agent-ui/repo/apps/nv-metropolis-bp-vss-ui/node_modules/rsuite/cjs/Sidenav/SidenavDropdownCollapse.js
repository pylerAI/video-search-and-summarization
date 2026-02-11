'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _Collapse = _interopRequireDefault(require("../Animation/Collapse"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const SidenavDropdownCollapse = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    as = 'ul',
    className,
    classPrefix = 'dropdown-menu',
    open,
    ...restProps
  } = props;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Collapse.default, {
    in: open,
    exitedClassName: prefix`collapse-out`,
    exitingClassName: prefix`collapsing`,
    enteredClassName: prefix`collapse-in`,
    enteringClassName: prefix`collapsing`
  }, (transitionProps, transitionRef) => {
    const {
      className: transitionClassName,
      ...transitionRestProps
    } = transitionProps;
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: (0, _utils.mergeRefs)(ref, transitionRef),
      role: "group",
      className: (0, _classnames.default)(classes, transitionClassName)
    }, restProps, transitionRestProps));
  });
});
SidenavDropdownCollapse.displayName = 'Sidenav.Dropdown.Collapse';
var _default = exports.default = SidenavDropdownCollapse;