'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _useCombobox = _interopRequireDefault(require("../Picker/hooks/useCombobox"));
var _ScrollView = _interopRequireDefault(require("../ScrollView"));
var _Box = _interopRequireDefault(require("../Box"));
var _TreeProvider = require("./TreeProvider");
var _utils = require("../utils");
const ScrollShadowView = (0, _utils.forwardRef)((props, ref) => {
  return /*#__PURE__*/_react.default.createElement(_ScrollView.default, (0, _extends2.default)({
    scrollShadow: true,
    ref: ref
  }, props));
});
const TreeView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'div',
    children,
    treeRootClassName,
    multiselectable,
    style,
    height,
    ...rest
  } = props;
  const {
    scrollShadow,
    virtualized
  } = (0, _TreeProvider.useTreeContextProps)();
  const {
    id,
    labelId,
    popupType
  } = (0, _useCombobox.default)();

  // If the tree is virtualized, the scroll shadow is not needed.
  const treeAs = scrollShadow && !virtualized ? ScrollShadowView : as;

  // If the tree is virtualized, the height is not needed.
  const viewStyles = (0, _utils.mergeStyles)(style, {
    '--rs-tree-view-height': virtualized ? undefined : (0, _utils.getCssValue)(height)
  });
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: treeAs,
    role: "tree",
    style: viewStyles,
    id: id ? `${id}-${popupType}` : undefined,
    "aria-multiselectable": multiselectable,
    "aria-labelledby": labelId,
    ref: ref
  }, rest), /*#__PURE__*/_react.default.createElement("div", {
    className: treeRootClassName
  }, children));
});
TreeView.displayName = 'TreeView';
var _default = exports.default = TreeView;