'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _CheckTreeNode = _interopRequireDefault(require("./CheckTreeNode"));
var _IndentLine = _interopRequireDefault(require("../Tree/IndentLine"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _useTreeSearch = _interopRequireDefault(require("../Tree/hooks/useTreeSearch"));
var _useFocusTree = _interopRequireDefault(require("../Tree/hooks/useFocusTree"));
var _useVirtualizedTreeData = _interopRequireDefault(require("../Tree/hooks/useVirtualizedTreeData"));
var _useTreeCheckState = _interopRequireDefault(require("./hooks/useTreeCheckState"));
var _useTreeNodeProps = _interopRequireDefault(require("./hooks/useTreeNodeProps"));
var _utils = require("../internals/utils");
var _Windowing = require("../internals/Windowing");
var _hooks = require("../internals/hooks");
var _utils2 = require("../internals/Tree/utils");
var _Picker = require("../internals/Picker");
var _Tree = require("../internals/Tree");
var _utils3 = require("./utils");
var _utils4 = require("../Tree/utils");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props for the CheckTreeView component.
 */

const CheckTreeView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    className,
    classPrefix = 'check-tree',
    cascade = true,
    data = [],
    disabledItemValues = [],
    expandItemValues = [],
    height = 360,
    locale: overrideLocale,
    listProps,
    listRef,
    style,
    searchKeyword,
    showIndentLine,
    searchable,
    searchInputRef,
    uncheckableItemValues = [],
    loadingNodeValues = [],
    flattenedNodes = {},
    searchBy,
    onChange,
    onSearch,
    onSelect,
    onSelectItem,
    onScroll,
    onExpand,
    onFocusItem,
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
    childrenKey,
    valueKey,
    virtualized,
    scrollShadow
  } = (0, _TreeProvider.useTreeContextProps)();
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    getCheckedValues
  } = (0, _useTreeCheckState.default)({
    cascade,
    flattenedNodes,
    uncheckableItemValues,
    disabledItemValues
  });
  const handleSearchCallback = (value, _data, event) => {
    onSearch === null || onSearch === void 0 || onSearch(value, event);
  };
  const {
    filteredData,
    keyword,
    setFilteredData,
    handleSearch
  } = (0, _useTreeSearch.default)({
    callback: handleSearchCallback,
    data,
    searchKeyword,
    searchBy
  });
  const {
    focusItemValue,
    setFocusItemValue,
    onTreeKeydown,
    saveTreeNodeRef
  } = (0, _useFocusTree.default)({
    filteredData,
    disabledItemValues,
    expandItemValues,
    searchKeyword: keyword,
    flattenedNodes,
    onFocused: onFocusItem,
    onExpand
  });
  const transformation = (0, _useVirtualizedTreeData.default)(flattenedNodes, filteredData, {
    cascade,
    expandItemValues,
    searchKeyword: keyword,
    disabledItemValues
  });

  /**
   * Get formatted nodes for render tree
   * @params render - renderNode function. only used when virtualized setting false
   */
  const getFormattedNodes = render => {
    if (virtualized) {
      return transformation().filter(item => item.visible);
    }
    return (0, _utils3.getFormattedTree)(flattenedNodes, filteredData, {
      childrenKey,
      cascade,
      disabledItemValues,
      valueKey
    }).map(node => render === null || render === void 0 ? void 0 : render(node, 1)).filter(item => item);
  };
  const getTreeNodeProps = (0, _useTreeNodeProps.default)({
    uncheckableItemValues,
    disabledItemValues,
    loadingNodeValues,
    focusItemValue,
    flattenedNodes,
    keyword
  });
  (0, _react.useEffect)(() => {
    setFilteredData(data, keyword);
  }, [data, keyword, setFilteredData]);

  // TODO-Doma
  // Replace `getKeyParentMap` with `getParentMap`
  const itemParentMap = (0, _react.useMemo)(() => (0, _utils2.getKeyParentMap)(data, node => node[valueKey], node => node[childrenKey]), [childrenKey, data, valueKey]);
  const handleSelect = (0, _hooks.useEventCallback)((node, event) => {
    const currentNode = node.refKey ? flattenedNodes[node.refKey] : null;
    if (!node || !currentNode) {
      return;
    }
    const checkedValues = getCheckedValues(node, !currentNode.check);
    const path = (0, _utils2.getPathTowardsItem)(node, item => itemParentMap.get(item[valueKey]));
    setFocusItemValue(node[valueKey]);
    onChange === null || onChange === void 0 || onChange(checkedValues, event);
    onSelect === null || onSelect === void 0 || onSelect(node, checkedValues, event);
    onSelectItem === null || onSelectItem === void 0 || onSelectItem(node, path);
  });
  const selectActiveItem = event => {
    if ((0, _isNil.default)(focusItemValue)) return;
    const activeItem = (0, _utils4.getActiveItem)(focusItemValue, flattenedNodes, valueKey);
    if (!(0, _utils3.isNodeUncheckable)(activeItem, {
      uncheckableItemValues,
      valueKey
    }) && activeItem !== null) {
      handleSelect(activeItem, event);
    }
  };
  const handleTreeKeyDown = (0, _hooks.useEventCallback)(event => {
    onTreeKeydown(event);
    (0, _Picker.onMenuKeyDown)(event, {
      enter: selectActiveItem
    });
  });
  const renderNode = (node, layer) => {
    const {
      visible,
      refKey,
      parent
    } = node;

    // when searching, all nodes should be expand
    const expanded = (0, _utils4.isExpand)(keyword, expandItemValues.includes(node[valueKey]));
    if (!visible) {
      return null;
    }
    const children = node[childrenKey];
    const hasChildren = keyword ? (0, _utils4.hasVisibleChildren)(node, childrenKey) : Boolean(children);
    const treeNodeProps = {
      // The spread operator does not copy non-enumerable properties,
      // so we need to copy the `parent` property manually.
      ...getTreeNodeProps({
        ...node,
        parent
      }),
      layer,
      expanded,
      hasChildren,
      onSelect: handleSelect,
      onExpand
    };
    if (hasChildren) {
      layer += 1;
      const childClassName = merge(prefix('node-children'), {
        [prefix('node-expanded')]: expanded
      });
      const nodes = children || [];
      return /*#__PURE__*/_react.default.createElement("div", {
        className: childClassName,
        key: node[valueKey]
      }, /*#__PURE__*/_react.default.createElement(_CheckTreeNode.default, (0, _extends2.default)({}, treeNodeProps, {
        treeItemRef: ref => saveTreeNodeRef(ref, refKey)
      })), /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('group'),
        role: "group"
      }, nodes.map(child => renderNode(child, layer)), showIndentLine && /*#__PURE__*/_react.default.createElement(_IndentLine.default, null)));
    }
    return /*#__PURE__*/_react.default.createElement(_CheckTreeNode.default, (0, _extends2.default)({
      key: node[valueKey],
      treeItemRef: ref => saveTreeNodeRef(ref, refKey)
    }, treeNodeProps));
  };
  const renderVirtualListNode = ({
    index,
    style,
    data
  }) => {
    const node = data[index];
    const {
      layer,
      refKey,
      visible,
      hasChildren,
      parent
    } = node;
    const expanded = (0, _utils4.isExpand)(keyword, expandItemValues.includes(node[valueKey]));
    const treeNodeProps = {
      // The spread operator does not copy non-enumerable properties,
      // so we need to copy the `parent` property manually.
      ...getTreeNodeProps({
        ...node,
        parent
      }),
      onSelect: handleSelect,
      onExpand,
      expanded,
      layer,
      hasChildren
    };
    return visible && /*#__PURE__*/_react.default.createElement(_CheckTreeNode.default, (0, _extends2.default)({
      style: style,
      ref: ref => saveTreeNodeRef(ref, refKey)
    }, treeNodeProps));
  };
  const classes = merge(className, withPrefix({
    'without-children': !(0, _utils3.hasGrandchild)(data, childrenKey),
    virtualized
  }));
  const formattedNodes = getFormattedNodes(renderNode);
  const treeNodesClass = merge(prefix('root'), {
    [prefix('all-uncheckable')]: (0, _utils3.isEveryFirstLevelNodeUncheckable)(flattenedNodes, uncheckableItemValues, valueKey)
  });
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
    multiselectable: true,
    treeRootClassName: treeNodesClass,
    className: prefix('view'),
    onScroll: onScroll,
    onKeyDown: handleTreeKeyDown,
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
CheckTreeView.displayName = 'CheckTreeView';
var _default = exports.default = CheckTreeView;