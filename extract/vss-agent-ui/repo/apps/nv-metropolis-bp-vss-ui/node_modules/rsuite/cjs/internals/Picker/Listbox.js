'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _isString = _interopRequireDefault(require("lodash/isString"));
var _isNumber = _interopRequireDefault(require("lodash/isNumber"));
var _findIndex = _interopRequireDefault(require("lodash/findIndex"));
var _pickBy = _interopRequireDefault(require("lodash/pickBy"));
var _getPosition = _interopRequireDefault(require("dom-lib/getPosition"));
var _scrollTop = _interopRequireDefault(require("dom-lib/scrollTop"));
var _getHeight = _interopRequireDefault(require("dom-lib/getHeight"));
var _get = _interopRequireDefault(require("lodash/get"));
var _classnames = _interopRequireDefault(require("classnames"));
var _ListItemGroup = _interopRequireDefault(require("./ListItemGroup"));
var _useCombobox = _interopRequireDefault(require("./hooks/useCombobox"));
var _Highlight = _interopRequireDefault(require("../../Highlight"));
var _Windowing = require("../Windowing");
var _symbols = require("../symbols");
var _hooks = require("../hooks");
var _utils = require("../utils");
var _getDataGroupBy = require("../utils/getDataGroupBy");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props for the Listbox component.
 */
/**
 * Props for the Listbox component.
 * @template Multiple - Whether multiple selection is enabled.
 */

const Listbox = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    data = [],
    groupBy,
    maxHeight = 320,
    activeItemValues = [],
    disabledItemValues = [],
    classPrefix = 'listbox',
    valueKey = 'value',
    labelKey = 'label',
    virtualized,
    listProps,
    listRef: virtualizedListRef,
    className,
    style,
    focusItemValue,
    listItemClassPrefix,
    listItemAs: ListItem,
    listItemProps,
    rowHeight = 36,
    rowGroupHeight = 48,
    query,
    renderOptionGroup,
    renderOption,
    onGroupTitleClick,
    onSelect,
    ...rest
  } = props;
  const {
    prefix,
    merge,
    rootPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const groupable = typeof groupBy !== 'undefined';
  const classes = merge(className, rootPrefix('picker-listbox'), prefix('items', {
    grouped: groupable
  }));
  const {
    id,
    labelId,
    popupType,
    multiple
  } = (0, _useCombobox.default)();
  const menuBodyContainerRef = (0, _react.useRef)(null);
  const listRef = (0, _react.useRef)(null);
  const [foldedGroupKeys, setFoldedGroupKeys] = (0, _react.useState)([]);
  const handleGroupTitleClick = (0, _hooks.useEventCallback)((key, event) => {
    const nextGroupKeys = foldedGroupKeys.filter(item => item !== key);
    if (nextGroupKeys.length === foldedGroupKeys.length) {
      nextGroupKeys.push(key);
    }
    setFoldedGroupKeys(nextGroupKeys);
    onGroupTitleClick === null || onGroupTitleClick === void 0 || onGroupTitleClick(event);
  });
  const handleSelect = (0, _hooks.useEventCallback)((item, value, event, checked) => {
    onSelect === null || onSelect === void 0 || onSelect(value, item, event, checked);
  });
  const getRowHeight = (list, index) => {
    const item = list[index];
    if (groupable && item[_symbols.RSUITE_PICKER_GROUP_KEY] && index !== 0) {
      return rowGroupHeight;
    }
    return rowHeight;
  };
  (0, _react.useEffect)(() => {
    const container = menuBodyContainerRef.current;
    if (!container) {
      return;
    }
    let activeItem = container.querySelector(`.${prefix('item-focus')}`);
    if (!activeItem) {
      activeItem = container.querySelector(`.${prefix('item-active')}`);
    }
    if (!activeItem) {
      return;
    }
    const position = (0, _getPosition.default)(activeItem, container);
    const sTop = (0, _scrollTop.default)(container);
    const sHeight = (0, _getHeight.default)(container);
    if (sTop > position.top) {
      (0, _scrollTop.default)(container, Math.max(0, position.top - 20));
    } else if (position.top > sTop + sHeight) {
      (0, _scrollTop.default)(container, Math.max(0, position.top - sHeight + 32));
    }
  }, [focusItemValue, menuBodyContainerRef, prefix]);
  const filteredItems = groupable ? data.filter(item => {
    var _item$parent;
    // Display group title items
    if (item[_symbols.RSUITE_PICKER_GROUP_KEY]) return true;

    // Display items under the unfolded group
    const groupValue = (0, _get.default)(item, groupBy, '') || (// FIXME-Doma
    // Usage of `item.parent` is strongly discouraged
    // It's only here for legacy support
    // Remove once `item.parent` is completely removed across related components
    (_item$parent = item.parent) === null || _item$parent === void 0 ? void 0 : _item$parent[_getDataGroupBy.KEY_GROUP_TITLE]);
    return !foldedGroupKeys.includes(groupValue);
  }) : data;
  const rowCount = filteredItems.length;
  const renderItem = ({
    index = 0,
    style,
    data,
    item: itemData
  }) => {
    const item = itemData || data[index];
    const value = item[valueKey];
    const itemLabel = item[labelKey];
    const label = query ? /*#__PURE__*/_react.default.createElement(_Highlight.default, {
      query: query,
      as: "span"
    }, itemLabel) : itemLabel;
    if ((0, _isUndefined.default)(label) && !item[_symbols.RSUITE_PICKER_GROUP_KEY]) {
      throw Error(`labelKey "${labelKey}" is not defined in "data" : ${index}`);
    }

    // Use `value` in keys when If `value` is string or number
    const itemKey = (0, _isString.default)(value) || (0, _isNumber.default)(value) ? value : index;

    //  Render <ListboxGroup> component when `groupBy` is defined
    if (groupable && item[_symbols.RSUITE_PICKER_GROUP_KEY]) {
      const groupValue = item[_getDataGroupBy.KEY_GROUP_TITLE];
      return /*#__PURE__*/_react.default.createElement(_ListItemGroup.default, {
        style: style,
        classPrefix: 'picker-menu-group',
        className: (0, _classnames.default)({
          folded: foldedGroupKeys.some(key => key === groupValue)
        }),
        key: `group-${groupValue}`,
        onClick: handleGroupTitleClick.bind(null, groupValue)
      }, renderOptionGroup ? renderOptionGroup(groupValue, item) : groupValue);
    } else if ((0, _isUndefined.default)(value) && !(0, _isUndefined.default)(item[_symbols.RSUITE_PICKER_GROUP_KEY])) {
      throw Error(`valueKey "${valueKey}" is not defined in "data" : ${index} `);
    }
    const disabled = disabledItemValues === null || disabledItemValues === void 0 ? void 0 : disabledItemValues.some(disabledValue => (0, _utils.shallowEqual)(disabledValue, value));
    const active = activeItemValues === null || activeItemValues === void 0 ? void 0 : activeItemValues.some(v => (0, _utils.shallowEqual)(v, value));
    const focus = !(0, _isUndefined.default)(focusItemValue) && (0, _utils.shallowEqual)(focusItemValue, value);
    return /*#__PURE__*/_react.default.createElement(ListItem, (0, _extends2.default)({
      "aria-posinset": index + 1,
      "aria-setsize": rowCount,
      style: style,
      key: itemKey,
      disabled: disabled,
      active: active,
      focus: focus,
      value: value,
      classPrefix: listItemClassPrefix,
      onSelect: handleSelect.bind(null, item)
    }, (0, _pickBy.default)(listItemProps, v => v !== undefined)), renderOption ? renderOption(label, item) : label);
  };
  (0, _hooks.useMount)(() => {
    var _listRef$current, _listRef$current$scro;
    const itemIndex = (0, _findIndex.default)(filteredItems, item => item[valueKey] === (activeItemValues === null || activeItemValues === void 0 ? void 0 : activeItemValues[0]));
    (_listRef$current = listRef.current) === null || _listRef$current === void 0 || (_listRef$current$scro = _listRef$current.scrollToItem) === null || _listRef$current$scro === void 0 || _listRef$current$scro.call(_listRef$current, itemIndex);
  });
  const styles = (0, _utils.mergeStyles)(style, {
    '--rs-picker-listbox-max-height': (0, _utils.getCssValue)(maxHeight)
  });
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    role: "listbox",
    id: `${id}-${popupType}`,
    "aria-labelledby": labelId,
    "aria-multiselectable": multiple,
    className: classes,
    ref: (0, _utils.mergeRefs)(menuBodyContainerRef, ref),
    style: styles
  }, rest), virtualized ? /*#__PURE__*/_react.default.createElement(_Windowing.AutoSizer, {
    defaultHeight: maxHeight,
    style: {
      width: 'auto',
      height: 'auto'
    }
  }, ({
    height
  }) => /*#__PURE__*/_react.default.createElement(_Windowing.List, (0, _extends2.default)({
    as: _Windowing.VariableSizeList,
    ref: (0, _utils.mergeRefs)(listRef, virtualizedListRef),
    height: height || maxHeight,
    itemCount: rowCount,
    itemData: filteredItems,
    itemSize: getRowHeight.bind(void 0, filteredItems),
    className: rootPrefix('virt-list')
  }, listProps), renderItem)) : filteredItems.map((item, index) => renderItem({
    index,
    item
  })));
});
Listbox.displayName = 'Listbox';
var _default = exports.default = Listbox;