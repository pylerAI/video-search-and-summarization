'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _useTreeValue = _interopRequireDefault(require("./hooks/useTreeValue"));
var _CheckTreeView = _interopRequireDefault(require("./CheckTreeView"));
var _useFlattenTree = _interopRequireDefault(require("../Tree/hooks/useFlattenTree"));
var _useTreeWithChildren = _interopRequireDefault(require("../Tree/hooks/useTreeWithChildren"));
var _useExpandTree = _interopRequireDefault(require("../Tree/hooks/useExpandTree"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `CheckTree` component is used for selecting multiple options which are organized in a tree structure.
 * @see https://rsuitejs.com/components/check-tree
 */
const CheckTree = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('CheckTree', props);
  const {
    value: controlledValue,
    data,
    defaultValue,
    defaultExpandAll = false,
    defaultExpandItemValues = [],
    uncheckableItemValues,
    disabledItemValues,
    expandItemValues: controlledExpandItemValues,
    childrenKey = 'children',
    labelKey = 'label',
    valueKey = 'value',
    virtualized,
    cascade = true,
    scrollShadow,
    renderTreeIcon,
    renderTreeNode,
    getChildren,
    onExpand,
    onChange,
    ...rest
  } = propsWithDefaults;
  const [value, setValue] = (0, _useTreeValue.default)(controlledValue, {
    defaultValue,
    uncheckableItemValues
  });
  const itemDataKeys = {
    childrenKey,
    labelKey,
    valueKey
  };
  const {
    treeData,
    loadingNodeValues,
    appendChild
  } = (0, _useTreeWithChildren.default)(data, itemDataKeys);
  const {
    expandItemValues,
    handleExpandTreeNode
  } = (0, _useExpandTree.default)(data, {
    ...itemDataKeys,
    defaultExpandAll,
    defaultExpandItemValues,
    controlledExpandItemValues,
    onExpand,
    getChildren,
    appendChild
  });
  const flattenedNodes = (0, _useFlattenTree.default)(treeData, {
    ...itemDataKeys,
    uncheckableItemValues,
    disabledItemValues,
    multiple: true,
    cascade,
    value
  });
  const handleChange = (0, _hooks.useEventCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  });
  const treeContext = (0, _react.useMemo)(() => ({
    props: {
      labelKey,
      valueKey,
      childrenKey,
      virtualized,
      scrollShadow,
      renderTreeIcon,
      renderTreeNode
    }
  }), [childrenKey, labelKey, valueKey, virtualized, scrollShadow, renderTreeIcon, renderTreeNode]);
  return /*#__PURE__*/_react.default.createElement(_TreeProvider.TreeProvider, {
    value: treeContext
  }, /*#__PURE__*/_react.default.createElement(_CheckTreeView.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    value: value,
    cascade: cascade,
    data: treeData,
    loadingNodeValues: loadingNodeValues,
    flattenedNodes: flattenedNodes,
    uncheckableItemValues: uncheckableItemValues,
    disabledItemValues: disabledItemValues,
    expandItemValues: expandItemValues,
    onChange: handleChange,
    onExpand: handleExpandTreeNode
  })));
});
CheckTree.displayName = 'CheckTree';
var _default = exports.default = CheckTree;