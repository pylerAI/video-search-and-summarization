'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _TreeNode = _interopRequireDefault(require("./TreeNode"));
var _IndentLine = _interopRequireDefault(require("./IndentLine"));
var _useTreeSearch = _interopRequireDefault(require("./hooks/useTreeSearch"));
var _useTreeDrag = _interopRequireDefault(require("./hooks/useTreeDrag"));
var _useFocusTree = _interopRequireDefault(require("./hooks/useFocusTree"));
var _useVirtualizedTreeData = _interopRequireDefault(require("./hooks/useVirtualizedTreeData"));
var _useTreeNodeProps = _interopRequireDefault(require("./hooks/useTreeNodeProps"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _Windowing = require("../internals/Windowing");
var _utils = require("../internals/utils");
var _utils2 = require("../internals/Tree/utils");
var _hooks = require("../internals/hooks");
var _utils3 = require("./utils");
var _Picker = require("../internals/Picker");
var _Tree = require("../internals/Tree");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props for the TreeViewInner component.
 */
/**
 * Represents the props for the TreeView component.
 */

const TreeView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    data = [],
    style,
    showIndentLine,
    value: valueProp,
    locale: overrideLocale,
    height = 360,
    className,
    searchable = false,
    classPrefix = 'tree',
    searchKeyword,
    searchBy,
    draggable,
    disabledItemValues = [],
    loadingNodeValues = [],
    flattenedNodes = {},
    listProps,
    listRef,
    searchInputRef,
    expandItemValues = [],
    onSearch,
    onSelect,
    onSelectItem,
    onDragEnd,
    onDragStart,
    onDragEnter,
    onDragLeave,
    onDragOver,
    onDrop,
    onExpand,
    onFocusItem,
    onScroll,
    ...rest
  } = props;
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const {
    searchPlaceholder,
    noResultsText
  } = getLocale('Combobox', overrideLocale);
  const {
    valueKey,
    childrenKey,
    scrollShadow,
    virtualized
  } = (0, _TreeProvider.useTreeContextProps)();
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleSearchCallback = (0, _hooks.useEventCallback)((value, _data, event) => {
    onSearch === null || onSearch === void 0 || onSearch(value, event);
  });
  const {
    filteredData,
    keyword,
    setFilteredData,
    handleSearch
  } = (0, _useTreeSearch.default)({
    callback: handleSearchCallback,
    searchKeyword,
    data,
    searchBy
  });
  const transformation = (0, _useVirtualizedTreeData.default)(flattenedNodes, filteredData, {
    expandItemValues,
    searchKeyword: keyword
  });
  const getFormattedNodes = render => {
    if (virtualized) {
      return transformation().filter(n => n.visible);
    }
    return filteredData.map((dataItem, index) => render === null || render === void 0 ? void 0 : render(dataItem, index, 1)).filter(n => n);
  };
  (0, _react.useEffect)(() => {
    setFilteredData(data, keyword);
  }, [data, keyword, setFilteredData]);

  // TODO-Doma
  // Replace `getKeyParentMap` with `getParentMap`
  const itemParentMap = (0, _react.useMemo)(() => (0, _utils2.getKeyParentMap)(data, node => node[valueKey], node => node[childrenKey]), [childrenKey, data, valueKey]);
  const {
    focusItemValue,
    setFocusItemValue,
    onTreeKeydown,
    treeNodesRefs,
    saveTreeNodeRef,
    treeViewRef
  } = (0, _useFocusTree.default)({
    filteredData,
    disabledItemValues,
    expandItemValues,
    searchKeyword: keyword,
    flattenedNodes,
    onFocused: onFocusItem,
    onExpand
  });
  const {
    dragNode,
    dragOverNodeKey,
    dropNodePosition,
    dragEvents
  } = (0, _useTreeDrag.default)({
    flattenedNodes,
    treeNodesRefs,
    draggable,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop,
    prefix
  });
  const getTreeNodeProps = (0, _useTreeNodeProps.default)({
    value: valueProp,
    disabledItemValues,
    loadingNodeValues,
    focusItemValue,
    keyword,
    dragNode,
    dragOverNodeKey,
    dropNodePosition
  });
  const handleSelect = (0, _hooks.useEventCallback)((nodeData, event) => {
    if (!nodeData) {
      return;
    }
    const nextValue = nodeData[valueKey];
    const path = (0, _utils2.getPathTowardsItem)(nodeData, item => itemParentMap.get(item[valueKey]));
    setFocusItemValue(nextValue);
    onSelect === null || onSelect === void 0 || onSelect(nodeData, nextValue, event);
    onSelectItem === null || onSelectItem === void 0 || onSelectItem(nodeData, path);
  });
  const selectActiveItem = (0, _hooks.useEventCallback)(event => {
    if ((0, _isNil.default)(focusItemValue)) return;
    const activeItem = (0, _utils3.getActiveItem)(focusItemValue, flattenedNodes, valueKey);
    handleSelect(activeItem, event);
  });
  const handleTreeKeyDown = (0, _hooks.useEventCallback)(event => {
    onTreeKeydown(event);
    (0, _Picker.onMenuKeyDown)(event, {
      enter: selectActiveItem
    });
  });
  const renderNode = (node, index, layer) => {
    const {
      visible
    } = node;
    if (!visible) {
      return null;
    }
    const children = node[childrenKey];
    const expanded = (0, _utils3.isExpand)(keyword, expandItemValues.includes(node[valueKey]));
    const hasChildren = keyword ? (0, _utils3.hasVisibleChildren)(node, childrenKey) : Boolean(children);
    const nodeProps = {
      ...getTreeNodeProps(node, layer, index),
      ...dragEvents,
      expanded,
      draggable,
      onExpand,
      onSelect: handleSelect,
      hasChildren
    };
    if (hasChildren) {
      layer += 1;
      const childClassName = merge(prefix('node-children'), {
        [prefix('node-expanded')]: expanded
      });
      return /*#__PURE__*/_react.default.createElement("div", {
        className: childClassName,
        key: node[valueKey]
      }, /*#__PURE__*/_react.default.createElement(_TreeNode.default, (0, _extends2.default)({}, nodeProps, {
        ref: ref => saveTreeNodeRef(ref, node.refKey)
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('group'),
        role: "group"
      }, children === null || children === void 0 ? void 0 : children.map((child, i) => renderNode(child, i, layer)), showIndentLine && /*#__PURE__*/_react.default.createElement(_IndentLine.default, null)));
    }
    return /*#__PURE__*/_react.default.createElement(_TreeNode.default, (0, _extends2.default)({
      ref: ref => saveTreeNodeRef(ref, node.refKey),
      key: node[valueKey]
    }, nodeProps));
  };
  const renderVirtualListNode = ({
    index,
    style,
    data
  }) => {
    const node = data[index];
    const {
      layer,
      visible,
      hasChildren
    } = node;
    const expanded = (0, _utils3.isExpand)(keyword, expandItemValues.includes(node[valueKey]));
    if (!visible) {
      return null;
    }
    const treeNodeProps = {
      ...getTreeNodeProps(node, layer),
      ...dragEvents,
      expanded,
      style,
      onExpand,
      onSelect: handleSelect,
      hasChildren
    };
    return visible && /*#__PURE__*/_react.default.createElement(_TreeNode.default, (0, _extends2.default)({
      ref: ref => saveTreeNodeRef(ref, node.refKey)
    }, treeNodeProps));
  };
  const classes = merge(withPrefix({
    virtualized
  }), className);
  const formattedNodes = getFormattedNodes(renderNode);
  return /*#__PURE__*/_react.default.createElement(_Box.default, {
    as: as,
    ref: ref,
    className: classes,
    style: style
  }, searchable ? /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    placeholder: searchPlaceholder,
    onChange: handleSearch,
    value: keyword,
    inputRef: searchInputRef
  }) : null, keyword && formattedNodes.length === 0 ? /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('empty')
  }, noResultsText) : null, /*#__PURE__*/_react.default.createElement(_Tree.TreeView, (0, _extends2.default)({}, rest, {
    ref: treeViewRef,
    treeRootClassName: prefix('root'),
    onScroll: onScroll,
    onKeyDown: handleTreeKeyDown,
    className: prefix('view'),
    height: height
  }), virtualized ? /*#__PURE__*/_react.default.createElement(_Windowing.AutoSizer, {
    defaultHeight: height,
    style: {
      width: 'auto',
      height: 'auto'
    },
    className: prefix('virt-auto-sizer')
  }, ({
    height
  }) => /*#__PURE__*/_react.default.createElement(_Windowing.List, (0, _extends2.default)({
    ref: listRef,
    height: height,
    itemSize: _Windowing.defaultItemSize,
    itemCount: formattedNodes.length,
    itemData: formattedNodes,
    className: prefix('virt-list'),
    scrollShadow: scrollShadow
  }, listProps), renderVirtualListNode)) : formattedNodes));
});
TreeView.displayName = 'TreeView';
var _default = exports.default = TreeView;