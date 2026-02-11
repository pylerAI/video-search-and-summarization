'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Collapse = _interopRequireDefault(require("../Animation/Collapse"));
var _ScrollView = _interopRequireDefault(require("../internals/ScrollView"));
var _hooks = require("../internals/hooks");
const PanelBody = props => {
  const {
    classPrefix = 'panel-body',
    children,
    collapsible,
    expanded,
    bodyFill,
    role,
    id,
    labelId,
    scrollShadow,
    className,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    onExited,
    onScroll,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const bodyClasses = merge(className, withPrefix({
    fill: bodyFill
  }));
  const renderBody = bodyProps => {
    return /*#__PURE__*/_react.default.createElement(_ScrollView.default, (0, _extends2.default)({}, rest, bodyProps, {
      customScrollbar: true,
      className: bodyClasses,
      onScroll: onScroll,
      scrollShadow: scrollShadow
    }), children);
  };
  return collapsible ? /*#__PURE__*/_react.default.createElement(_Collapse.default, {
    in: expanded,
    onEnter: onEnter,
    onEntering: onEntering,
    onEntered: onEntered,
    onExit: onExit,
    onExiting: onExiting,
    onExited: onExited
  }, (transitionProps, ref) => {
    const {
      className,
      ...rest
    } = transitionProps;
    return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({}, rest, {
      className: merge(className, prefix('collapse')),
      ref: ref
    }), renderBody({
      role,
      id,
      'aria-labelledby': labelId
    }));
  }) : renderBody();
};
var _default = exports.default = PanelBody;