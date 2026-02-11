'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Slide = _interopRequireDefault(require("../Animation/Slide"));
var _Modal = _interopRequireDefault(require("../Modal"));
var _DrawerBody = _interopRequireDefault(require("./DrawerBody"));
var _DrawerHeader = _interopRequireDefault(require("./DrawerHeader"));
var _DrawerActions = _interopRequireDefault(require("./DrawerActions"));
var _DrawerFooter = _interopRequireDefault(require("./DrawerFooter"));
var _DrawerTitle = _interopRequireDefault(require("./DrawerTitle"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const Subcomponents = {
  Body: _DrawerBody.default,
  Header: _DrawerHeader.default,
  Actions: _DrawerActions.default,
  Title: _DrawerTitle.default,
  /**
   * @deprecated use <Drawer.Actions> instead
   */
  Footer: (0, _utils.deprecateComponent)(_DrawerFooter.default, '<Drawer.Footer> has been deprecated, use <Drawer.Actions> instead.')
};

/**
 * The Drawer component is used to display extra content from a main content.
 * @see https://rsuitejs.com/components/drawer
 */
const Drawer = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Drawer', props);
  const {
    className,
    placement = 'right',
    classPrefix = 'drawer',
    animation = _Slide.default,
    closeButton = true,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, prefix(placement));
  const animationProps = {
    placement
  };
  return /*#__PURE__*/_react.default.createElement(_Modal.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    overflow: false,
    classPrefix: classPrefix,
    className: classes,
    animation: animation,
    animationProps: animationProps,
    isDrawer: true,
    closeButton: closeButton
  }));
}, Subcomponents);
Drawer.displayName = 'Drawer';
var _default = exports.default = Drawer;