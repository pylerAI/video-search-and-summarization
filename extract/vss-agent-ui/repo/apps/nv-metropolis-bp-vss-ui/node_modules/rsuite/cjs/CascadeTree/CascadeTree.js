'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _TreeView = _interopRequireDefault(require("./TreeView"));
var _SearchView = _interopRequireDefault(require("./SearchView"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _utils2 = require("../internals/Tree/utils");
var _utils3 = require("../Tree/utils");
var _hooks = require("../internals/hooks");
var _hooks2 = require("./hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * CascadeTree is a component that displays tree-structured data in columns.
 *
 * @see https://rsuitejs.com/components/cascade-tree
 */
const CascadeTree = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('CascadeTree', props);
  const {
    as,
    data = [],
    defaultValue,
    className,
    classPrefix = 'cascade-tree',
    childrenKey = 'children',
    valueKey = 'value',
    labelKey = 'label',
    locale,
    value: valueProp,
    disabledItemValues = [],
    columnWidth,
    columnHeight,
    searchable,
    renderTreeNode,
    renderColumn,
    onSelect,
    onSearch,
    onChange,
    getChildren,
    ...rest
  } = propsWithDefaults;
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);

  // Store the children of each node
  const childrenMap = (0, _hooks.useMap)();

  // Store the parent of each node
  const parentMap = (0, _react.useMemo)(() => (0, _utils2.getParentMap)(data, item => {
    var _childrenMap$get;
    return (_childrenMap$get = childrenMap.get(item)) !== null && _childrenMap$get !== void 0 ? _childrenMap$get : item[childrenKey];
  }), [childrenMap, childrenKey, data]);

  // Flatten the tree data
  const flattenedData = (0, _react.useMemo)(() => (0, _utils3.flattenTree)(data, item => {
    var _childrenMap$get2;
    return (_childrenMap$get2 = childrenMap.get(item)) !== null && _childrenMap$get2 !== void 0 ? _childrenMap$get2 : item[childrenKey];
  }), [childrenMap, childrenKey, data]);

  // The selected item
  const selectedItem = flattenedData.find(item => item[valueKey] === value);

  // Callback function after selecting the node
  const onSelectCallback = (node, event) => {
    const {
      isLeafNode,
      cascadePaths,
      itemData
    } = node;
    onSelect === null || onSelect === void 0 || onSelect(itemData, cascadePaths, event);
    if (isLeafNode) {
      const nextValue = itemData[valueKey];
      setValue(nextValue);
    }
  };
  const {
    activeItem,
    loadingItemsSet,
    handleSelect
  } = (0, _hooks2.useSelect)({
    value,
    valueKey,
    childrenKey,
    childrenMap,
    selectedItem,
    getChildren,
    onChange,
    onSelect: onSelectCallback
  });
  const {
    columns,
    pathTowardsActiveItem
  } = (0, _hooks2.usePaths)({
    data,
    activeItem,
    selectedItem,
    getParent: item => parentMap.get(item),
    getChildren: item => {
      var _childrenMap$get3;
      return (_childrenMap$get3 = childrenMap.get(item)) !== null && _childrenMap$get3 !== void 0 ? _childrenMap$get3 : item[childrenKey];
    }
  });
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const onSearchCallback = (0, _react.useCallback)((value, _items, event) => onSearch === null || onSearch === void 0 ? void 0 : onSearch(value, event), [onSearch]);
  const {
    items,
    searchKeyword,
    setSearchKeyword,
    handleSearch
  } = (0, _hooks2.useSearch)({
    labelKey,
    childrenKey,
    parentMap,
    flattenedData,
    onSearch: onSearchCallback
  });
  const handleSearchRowSelect = (0, _hooks.useEventCallback)((item, items, event) => {
    var _item$childrenKey;
    const node = {
      itemData: item,
      cascadePaths: items,
      isLeafNode: !((_item$childrenKey = item[childrenKey]) !== null && _item$childrenKey !== void 0 && _item$childrenKey.length)
    };
    handleSelect(node, event);
    setSearchKeyword('');
  });
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    className: classes
  }, rest, {
    ref: ref
  }), searchable && /*#__PURE__*/_react.default.createElement(_SearchView.default, {
    data: items,
    searchKeyword: searchKeyword,
    valueKey: valueKey,
    labelKey: labelKey,
    locale: locale,
    parentMap: parentMap,
    disabledItemValues: disabledItemValues,
    onSelect: handleSearchRowSelect,
    onSearch: handleSearch
  }), !searchKeyword && /*#__PURE__*/_react.default.createElement(_TreeView.default, {
    columnWidth: columnWidth,
    columnHeight: columnHeight,
    disabledItemValues: disabledItemValues,
    loadingItemsSet: loadingItemsSet,
    valueKey: valueKey,
    labelKey: labelKey,
    childrenKey: childrenKey,
    classPrefix: classPrefix,
    data: columns,
    cascadePaths: pathTowardsActiveItem,
    activeItemValue: value,
    onSelect: handleSelect,
    renderColumn: renderColumn,
    renderTreeNode: renderTreeNode
  }));
});
CascadeTree.displayName = 'CascadeTree';
var _default = exports.default = CascadeTree;