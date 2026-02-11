'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _Highlight = _interopRequireDefault(require("../Highlight"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/Tree/utils");
function SearchView(props) {
  const {
    as: Component = 'div',
    classPrefix = 'cascade-search-view',
    className,
    searchKeyword,
    labelKey,
    locale: overrideLocale,
    valueKey,
    parentMap,
    data,
    focusItemValue,
    disabledItemValues,
    inputRef,
    renderSearchItem,
    onSearch,
    onSelect,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix,
    rootPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const {
    searchPlaceholder,
    noResultsText
  } = getLocale('Combobox', overrideLocale);
  const renderSearchRow = (item, key) => {
    const items = (0, _utils.getPathTowardsItem)(item, item => parentMap.get(item));
    const formattedNodes = items.map(itemData => {
      const label = /*#__PURE__*/_react.default.createElement(_Highlight.default, {
        as: "span",
        query: searchKeyword
      }, itemData[labelKey]);
      return {
        ...itemData,
        [labelKey]: label
      };
    });
    const disabled = disabledItemValues.some(value => formattedNodes.some(itemData => itemData[valueKey] === value));
    const itemClasses = prefix('row', {
      'row-disabled': disabled,
      'row-focus': item[valueKey] === focusItemValue
    });
    const label = formattedNodes.map((itemData, index) => /*#__PURE__*/_react.default.createElement("span", {
      key: `col-${index}`,
      className: prefix('col')
    }, itemData[labelKey]));
    const handleCheck = event => {
      if (!disabled) {
        onSelect(item, items, event);
      }
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      role: "treeitem",
      "aria-disabled": disabled,
      "aria-label": item[labelKey],
      key: key,
      "data-key": item[valueKey],
      className: itemClasses,
      tabIndex: -1,
      onClick: handleCheck
    }, renderSearchItem ? renderSearchItem(label, items) : label);
  };
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    className: classes
  }, rest), /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
    placeholder: searchPlaceholder,
    onChange: onSearch,
    value: searchKeyword,
    inputRef: inputRef
  }), searchKeyword !== '' && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('panel'),
    "data-layer": 0,
    role: "tree"
  }, data.length ? data.map(renderSearchRow) : /*#__PURE__*/_react.default.createElement("div", {
    className: merge(prefix('none'), rootPrefix('picker-none'))
  }, noResultsText)));
}
var _default = exports.default = SearchView;