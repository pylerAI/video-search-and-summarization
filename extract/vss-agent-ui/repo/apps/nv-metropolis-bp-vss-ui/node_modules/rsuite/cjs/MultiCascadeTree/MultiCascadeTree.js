'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _TreeView = _interopRequireDefault(require("./TreeView"));
var _SearchView = _interopRequireDefault(require("./SearchView"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("./hooks");
var _hooks2 = require("../internals/hooks");
const emptyArray = [];

/**
 * The `MultiCascadeTree` component is used to select multiple values from cascading options.
 * @see https://rsuitejs.com/components/multi-cascade-tree/
 */
const MultiCascadeTree = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks2.useCustom)('MultiCascadeTree', props);
  const {
    as,
    data = emptyArray,
    defaultValue,
    className,
    classPrefix = 'cascade-tree',
    value: valueProp,
    valueKey = 'value',
    labelKey = 'label',
    locale,
    childrenKey = 'children',
    disabledItemValues = emptyArray,
    cascade = true,
    columnWidth,
    columnHeight,
    searchable,
    uncheckableItemValues = emptyArray,
    getChildren,
    renderColumn,
    renderTreeNode,
    onSelect,
    onCheck,
    onChange,
    onSearch,
    ...rest
  } = propsWithDefaults;
  const itemKeys = {
    childrenKey,
    labelKey,
    valueKey
  };
  const {
    selectedPaths,
    flattenData,
    columnData,
    handleSelect
  } = (0, _hooks.useSelect)({
    data,
    childrenKey,
    labelKey,
    valueKey,
    onSelect,
    getChildren
  });
  const [controlledValue] = (0, _hooks2.useControlled)(valueProp, defaultValue);
  const cascadeValueProps = {
    ...itemKeys,
    uncheckableItemValues,
    cascade,
    value: controlledValue,
    onCheck,
    onChange
  };
  const {
    value,
    handleCheck
  } = (0, _hooks.useCascadeValue)(cascadeValueProps, flattenData);
  const {
    items,
    searchKeyword,
    handleSearch
  } = (0, _hooks.useSearch)({
    labelKey,
    valueKey,
    childrenKey,
    flattenedData: flattenData,
    uncheckableItemValues,
    onSearch
  });
  const {
    withPrefix,
    merge
  } = (0, _hooks2.useStyles)(classPrefix);
  const classes = merge(className, withPrefix('multi'));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), searchable && /*#__PURE__*/_react.default.createElement(_SearchView.default, {
    cascade: cascade,
    data: items,
    value: value,
    searchKeyword: searchKeyword,
    valueKey: valueKey,
    labelKey: labelKey,
    locale: locale,
    childrenKey: childrenKey,
    disabledItemValues: disabledItemValues,
    onCheck: handleCheck,
    onSearch: handleSearch
  }), !searchKeyword && /*#__PURE__*/_react.default.createElement(_TreeView.default, {
    cascade: cascade,
    columnWidth: columnWidth,
    columnHeight: columnHeight,
    uncheckableItemValues: uncheckableItemValues,
    disabledItemValues: disabledItemValues,
    valueKey: valueKey,
    labelKey: labelKey,
    childrenKey: childrenKey,
    classPrefix: classPrefix,
    cascadeData: columnData,
    cascadePaths: selectedPaths,
    value: value,
    onSelect: handleSelect,
    onCheck: handleCheck,
    renderColumn: renderColumn,
    renderTreeNode: renderTreeNode
  }));
});
MultiCascadeTree.displayName = 'MultiCascadeTree';
var _default = exports.default = MultiCascadeTree;