'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Check = _interopRequireDefault(require("@rsuite/icons/Check"));
var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const STEP_STATUS_ICON = {
  finish: /*#__PURE__*/_react.default.createElement(_Check.default, null),
  wait: null,
  process: null,
  error: /*#__PURE__*/_react.default.createElement(_Close.default, null)
};
/**
 * The `Step.Item` component is used to set the layout of the child element in the `Steps` component.
 *
 * @see https://rsuitejs.com/components/steps
 */
const StepItem = (0, _utils.forwardRef)((props, ref) => {
  var _STEP_STATUS_ICON$sta;
  const {
    as: Component = 'div',
    className,
    classPrefix = 'steps-item',
    style,
    itemWidth,
    status,
    icon,
    stepNumber,
    description,
    title,
    ...rest
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const iconNode = icon ? /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('icon')
  }, icon) : /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('icon', {
      [`icon-${status}`]: status
    })
  }, status ? (_STEP_STATUS_ICON$sta = STEP_STATUS_ICON[status]) !== null && _STEP_STATUS_ICON$sta !== void 0 ? _STEP_STATUS_ICON$sta : stepNumber : stepNumber);
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    ref: ref,
    className: classes,
    style: (0, _utils.mergeStyles)({
      width: itemWidth
    }, style),
    "data-status": status,
    "data-custom-icon": !!icon
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('tail')
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('icon-wrapper')
  }, iconNode), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('title')
  }, title), description && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('description')
  }, description)));
});
StepItem.displayName = 'StepItem';
var _default = exports.default = StepItem;