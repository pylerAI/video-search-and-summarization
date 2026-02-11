'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _Checkbox = _interopRequireDefault(require("../Checkbox"));
var _Highlight = _interopRequireDefault(require("../Highlight"));
var _hooks = require("../internals/hooks");
var _utils = require("./utils");
function SearchView(props) {
  const {
    as: Component = 'div',
    classPrefix = 'cascade-search-view',
    className,
    searchKeyword,
    childrenKey,
    labelKey,
    valueKey,
    value,
    data,
    disabledItemValues,
    inputRef,
    cascade,
    locale: overrideLocale,
    onSearch,
    onCheck,
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
    const nodes = (0, _utils.getNodeParents)(item);
    const label = /*#__PURE__*/_react.default.createElement(_Highlight.default, {
      as: "span",
      query: searchKeyword
    }, item[labelKey]);
    nodes.push({
      ...item,
      [labelKey]: label
    });
    const active = value.some(value => {
      if (cascade) {
        return nodes.some(node => node[valueKey] === value);
      }
      return item[valueKey] === value;
    });
    const disabled = disabledItemValues.some(value => nodes.some(node => node[valueKey] === value));
    const rowClasses = prefix('row', {
      'row-disabled': disabled
    });
    const indeterminate = cascade && !active && (0, _utils.isSomeChildChecked)(item, value, {
      valueKey,
      childrenKey
    });
    const handleChange = (_value, checked, event) => {
      onCheck === null || onCheck === void 0 || onCheck(item, event, checked);
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      role: "treeitem",
      "aria-disabled": disabled,
      key: key,
      className: rowClasses,
      "data-key": item[valueKey]
    }, /*#__PURE__*/_react.default.createElement(_Checkbox.default, {
      disabled: disabled,
      checked: active,
      value: item[valueKey],
      indeterminate: indeterminate,
      onChange: handleChange
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('col-group')
    }, nodes.map((node, index) => /*#__PURE__*/_react.default.createElement("span", {
      key: `col-${index}`,
      className: prefix('col')
    }, node[labelKey])))));
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