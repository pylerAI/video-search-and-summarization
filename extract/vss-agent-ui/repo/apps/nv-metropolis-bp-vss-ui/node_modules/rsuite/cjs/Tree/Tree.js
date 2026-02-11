'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _useFlattenTree = _interopRequireDefault(require("./hooks/useFlattenTree"));
var _useTreeWithChildren = _interopRequireDefault(require("./hooks/useTreeWithChildren"));
var _useExpandTree = _interopRequireDefault(require("./hooks/useExpandTree"));
var _TreeView = _interopRequireDefault(require("./TreeView"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Tree` component is used to display hierarchical data.
 *
 * @see https://rsuitejs.com/components/tree
 */
const Tree = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Tree', props);
  const {
    value: controlledValue,
    defaultValue,
    childrenKey = 'children',
    labelKey = 'label',
    valueKey = 'value',
    data,
    defaultExpandAll = false,
    defaultExpandItemValues = [],
    expandItemValues: controlledExpandItemValues,
    virtualized,
    scrollShadow,
    renderTreeIcon,
    renderTreeNode,
    getChildren,
    onChange,
    onExpand,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const [value, setValue] = (0, _hooks.useControlled)(controlledValue, defaultValue);
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
  const flattenedNodes = (0, _useFlattenTree.default)(treeData, {
    ...itemDataKeys
  });
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
  const handleSelect = (0, _hooks.useEventCallback)((nodeData, nextValue, event) => {
    setValue(nextValue);
    onSelect === null || onSelect === void 0 || onSelect(nodeData, nextValue, event);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  });
  const treeContext = (0, _react.useMemo)(() => ({
    props: {
      childrenKey,
      labelKey,
      valueKey,
      virtualized,
      scrollShadow,
      renderTreeIcon,
      renderTreeNode
    }
  }), [childrenKey, labelKey, valueKey, scrollShadow, virtualized, renderTreeIcon, renderTreeNode]);
  return /*#__PURE__*/_react.default.createElement(_TreeProvider.TreeProvider, {
    value: treeContext
  }, /*#__PURE__*/_react.default.createElement(_TreeView.default, (0, _extends2.default)({
    ref: ref
  }, rest, {
    value: value,
    data: treeData,
    loadingNodeValues: loadingNodeValues,
    flattenedNodes: flattenedNodes,
    expandItemValues: expandItemValues,
    onSelect: handleSelect,
    onExpand: handleExpandTreeNode
  })));
});
Tree.displayName = 'Tree';
var _default = exports.default = Tree;