'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
const Mark = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'span',
    mark,
    last,
    classPrefix = 'slider-mark',
    className,
    renderMark
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    last
  }));
  if (renderMark) {
    return /*#__PURE__*/_react.default.createElement(_Box.default, {
      as: as,
      ref: ref,
      className: classes
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('content')
    }, renderMark(mark)));
  }
  return null;
});
Mark.displayName = 'Mark';
var _default = exports.default = Mark;