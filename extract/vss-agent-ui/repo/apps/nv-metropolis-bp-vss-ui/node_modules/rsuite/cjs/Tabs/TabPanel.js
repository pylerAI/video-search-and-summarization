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
const TabPanel = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    classPrefix = 'tab-panel',
    children,
    active,
    className,
    ...rest
  } = props;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "tabpanel",
    ref: ref,
    tabIndex: 0,
    hidden: !active,
    className: merge(className, withPrefix())
  }, rest), children);
});
TabPanel.displayName = 'TabPanel';
var _default = exports.default = TabPanel;