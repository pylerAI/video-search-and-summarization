'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useToggleCaret = useToggleCaret;
var _react = require("react");
var _ = require("./");
var _ArrowUpLine = _interopRequireDefault(require("@rsuite/icons/ArrowUpLine"));
var _ArrowDownLine = _interopRequireDefault(require("@rsuite/icons/ArrowDownLine"));
var _ArrowLeftLine = _interopRequireDefault(require("@rsuite/icons/ArrowLeftLine"));
var _ArrowRightLine = _interopRequireDefault(require("@rsuite/icons/ArrowRightLine"));
function useToggleCaret(placement) {
  const {
    rtl
  } = (0, _.useCustom)();
  return (0, _react.useMemo)(() => {
    switch (true) {
      case /^top/.test(placement):
        return _ArrowUpLine.default;
      case /^right/.test(placement):
        return rtl ? _ArrowLeftLine.default : _ArrowRightLine.default;
      case /^left/.test(placement):
        return rtl ? _ArrowRightLine.default : _ArrowLeftLine.default;
      case /^bottom/.test(placement):
      default:
        return _ArrowDownLine.default;
    }
  }, [placement, rtl]);
}
var _default = exports.default = useToggleCaret;