'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _statusIcons = require("../internals/constants/statusIcons");
var _hooks = require("../internals/hooks");
/**
 * Shared component for displaying progress information
 * Used by both ProgressLine and ProgressCircle
 */
const ProgressInfo = props => {
  const {
    percent,
    renderInfo,
    status,
    classPrefix
  } = props;
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const showIcon = status && status !== 'active';
  return /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('info')
  }, renderInfo ? renderInfo(percent, status) : showIcon ? _statusIcons.PROGRESS_STATUS_ICON[status] : `${percent}%`);
};
var _default = exports.default = ProgressInfo;