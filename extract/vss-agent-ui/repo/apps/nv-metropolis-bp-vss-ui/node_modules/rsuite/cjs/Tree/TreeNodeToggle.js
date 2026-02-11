'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _ArrowDown = _interopRequireDefault(require("@rsuite/icons/ArrowDown"));
var _ArrowRight = _interopRequireDefault(require("@rsuite/icons/ArrowRight"));
var _ArrowLeft = _interopRequireDefault(require("@rsuite/icons/ArrowLeft"));
var _Spinner = _interopRequireDefault(require("@rsuite/icons/Spinner"));
var _hooks = require("../internals/hooks");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function TreeNodeToggle(props) {
  const {
    data,
    loading,
    expanded,
    hasChildren,
    ...rest
  } = props;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    renderTreeIcon
  } = (0, _TreeProvider.useTreeCustomRenderer)();
  const {
    prefix
  } = (0, _hooks.useStyles)('tree-node');
  const IconElementType = expanded ? _ArrowDown.default : rtl ? _ArrowLeft.default : _ArrowRight.default;
  let icon = /*#__PURE__*/_react.default.createElement(IconElementType, {
    className: prefix('toggle-icon')
  });
  if (loading) {
    icon = /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('loading-icon')
    }, /*#__PURE__*/_react.default.createElement(_Spinner.default, {
      spin: true
    }));
  }
  if (data !== undefined && typeof renderTreeIcon === 'function') {
    const customIcon = renderTreeIcon(data, expanded);
    icon = customIcon !== null ? /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('custom-icon')
    }, customIcon) : icon;
  }
  return hasChildren ? /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    tabIndex: -1,
    role: "button",
    "aria-busy": loading ? true : undefined,
    "data-ref": data.refKey,
    className: prefix('toggle')
  }, rest), icon) : /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('toggle-placeholder')
  });
}
var _default = exports.default = TreeNodeToggle;