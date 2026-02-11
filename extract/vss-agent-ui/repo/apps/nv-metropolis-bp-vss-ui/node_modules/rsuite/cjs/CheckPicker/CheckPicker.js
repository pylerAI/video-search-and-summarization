'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _clone = _interopRequireDefault(require("lodash/clone"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _utils = require("../internals/Tree/utils");
var _hooks = require("../internals/hooks");
var _utils2 = require("../internals/utils");
var _Picker = require("../internals/Picker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];
/**
 * A component for selecting checkable items in a dropdown list.
 * @see https://rsuitejs.com/components/check-picker
 */
const CheckPicker = (0, _utils2.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('CheckPicker', props);
  const {
    appearance = 'default',
    as,
    block,
    className,
    cleanable = true,
    classPrefix = 'picker',
    countable = true,
    data = emptyArray,
    defaultValue,
    disabled,
    disabledItemValues = emptyArray,
    groupBy,
    id,
    labelKey = 'label',
    listProps,
    listboxMaxHeight = 320,
    locale,
    placeholder,
    placement = 'bottomStart',
    popupAutoWidth = true,
    popupClassName,
    popupStyle,
    searchable = true,
    sticky,
    style,
    size,
    toggleAs,
    value: valueProp,
    valueKey = 'value',
    virtualized,
    sort,
    searchBy,
    renderOption,
    renderOptionGroup,
    renderListbox,
    renderValue,
    renderExtraFooter,
    onGroupTitleClick,
    onSearch,
    onEnter,
    onExit,
    onClean,
    onChange,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const {
    trigger,
    root,
    target,
    overlay,
    list,
    searchInput
  } = (0, _Picker.usePickerRef)(ref);
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue || []);

  // Used to hover the focuse item  when trigger `onKeydown`
  const {
    focusItemValue,
    setFocusItemValue,
    onKeyDown: onFocusItem
  } = (0, _Picker.useFocusItemValue)(value === null || value === void 0 ? void 0 : value[0], {
    data,
    valueKey,
    target: () => overlay.current
  });
  const handleSearchCallback = (0, _hooks.useEventCallback)((searchKeyword, filteredData, event) => {
    var _filteredData$;
    // The first option after filtering is the focus.
    setFocusItemValue(filteredData === null || filteredData === void 0 || (_filteredData$ = filteredData[0]) === null || _filteredData$ === void 0 ? void 0 : _filteredData$[valueKey]);
    onSearch === null || onSearch === void 0 || onSearch(searchKeyword, event);
  });

  // Use search keywords to filter options.
  const {
    searchKeyword,
    filteredData,
    handleSearch,
    resetSearch,
    checkShouldDisplay
  } = (0, _Picker.useSearch)(data, {
    labelKey,
    searchBy,
    callback: handleSearchCallback
  });

  // Use component active state to support keyboard events.
  const [active, setActive] = (0, _react.useState)(false);

  // A list of shortcut options.
  // when opened again, the selected options are displayed at the top.
  const [stickyItems, setStickyItems] = (0, _react.useState)([]);
  const initStickyItems = () => {
    if (!sticky) {
      return;
    }
    let nextStickyItems = [];
    if (data && value.length) {
      nextStickyItems = data.filter(item => {
        return value.some(v => v === item[valueKey]);
      });
    }
    setStickyItems(nextStickyItems);
  };
  const handleChangeValue = (0, _hooks.useEventCallback)((value, event) => {
    onChange === null || onChange === void 0 || onChange(value, event);
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    if (disabled || !cleanable) {
      return;
    }
    setValue([]);
    onClean === null || onClean === void 0 || onClean(event);
    handleChangeValue([], event);
  });
  const handleMenuPressEnter = event => {
    const nextValue = (0, _clone.default)(value);
    if (!focusItemValue) {
      return;
    }
    if (!nextValue.some(v => (0, _utils2.shallowEqual)(v, focusItemValue))) {
      nextValue.push(focusItemValue);
    } else {
      (0, _remove.default)(nextValue, itemVal => (0, _utils2.shallowEqual)(itemVal, focusItemValue));
    }
    const focusItem = data.find(item => (0, _utils2.shallowEqual)(item === null || item === void 0 ? void 0 : item[valueKey], focusItemValue));
    setValue(nextValue);
    handleSelect(nextValue, focusItem, event);
    handleChangeValue(nextValue, event);
  };
  const onPickerKeyDown = (0, _Picker.useToggleKeyDownEvent)({
    toggle: !focusItemValue || !active,
    trigger,
    target,
    overlay,
    searchInput,
    active,
    onExit: handleClean,
    onMenuKeyDown: onFocusItem,
    onMenuPressEnter: handleMenuPressEnter,
    onMenuPressBackspace: handleClean,
    ...rest
  });
  const handleSelect = (0, _hooks.useEventCallback)((nextItemValue, item, event) => {
    onSelect === null || onSelect === void 0 || onSelect(nextItemValue, item, event);
  });
  const handleItemSelect = (0, _hooks.useEventCallback)((nextItemValue, item, event, checked) => {
    const nextValue = (0, _clone.default)(value);
    if (checked) {
      nextValue.push(nextItemValue);
    } else {
      (0, _remove.default)(nextValue, itemVal => (0, _utils2.shallowEqual)(itemVal, nextItemValue));
    }
    setValue(nextValue);
    setFocusItemValue(nextItemValue);
    handleSelect(nextValue, item, event);
    handleChangeValue(nextValue, event);
  });
  const handleEnter = (0, _hooks.useEventCallback)(() => {
    setActive(true);
  });
  const handleExit = (0, _hooks.useEventCallback)(() => {
    resetSearch();
    setFocusItemValue(null);
    setActive(false);
  });
  const selectedItems = data.filter(item => value === null || value === void 0 ? void 0 : value.some(val => (0, _utils2.shallowEqual)(item[valueKey], val))) || [];

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValue = selectedItems.length > 0 || (value === null || value === void 0 ? void 0 : value.length) > 0 && (0, _isFunction.default)(renderValue);
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  let selectedElement = placeholder;
  if (selectedItems.length > 0) {
    selectedElement = /*#__PURE__*/_react.default.createElement(_Picker.SelectedElement, {
      selectedItems: selectedItems,
      countable: countable,
      valueKey: valueKey,
      labelKey: labelKey,
      prefix: prefix,
      badgeSize: size
    });
  }
  if ((value === null || value === void 0 ? void 0 : value.length) > 0 && (0, _isFunction.default)(renderValue)) {
    selectedElement = renderValue(value, selectedItems, selectedElement);
    // If renderValue returns null or undefined, hasValue is false.
    if ((0, _isNil.default)(selectedElement)) {
      hasValue = false;
    }
  }
  const renderPopup = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(className, popupClassName, prefix('check-menu'));
    let items = filteredData;
    let filteredStickyItems = [];
    if (stickyItems) {
      filteredStickyItems = (0, _utils.filterNodesOfTree)(stickyItems, item => checkShouldDisplay(item));
      items = (0, _utils.filterNodesOfTree)(data, item => {
        return checkShouldDisplay(item) && !stickyItems.some(v => v[valueKey] === item[valueKey]);
      });
    }

    // Create a tree structure data when set `groupBy`
    if (groupBy) {
      items = (0, _utils2.getDataGroupBy)(items, groupBy, sort);
    } else if (typeof sort === 'function') {
      items = items.sort(sort(false));
    }
    const listbox = items.length || filteredStickyItems.length ? /*#__PURE__*/_react.default.createElement(_Picker.Listbox, {
      listProps: listProps,
      listRef: list,
      disabledItemValues: disabledItemValues,
      valueKey: valueKey,
      labelKey: labelKey,
      renderOptionGroup: renderOptionGroup,
      renderOption: renderOption,
      maxHeight: listboxMaxHeight,
      classPrefix: 'picker-check-menu',
      listItemAs: _Picker.ListCheckItem,
      activeItemValues: value,
      focusItemValue: focusItemValue,
      data: [...filteredStickyItems, ...items],
      groupBy: groupBy,
      onSelect: handleItemSelect,
      onGroupTitleClick: onGroupTitleClick,
      virtualized: virtualized,
      query: searchKeyword
    }) : /*#__PURE__*/_react.default.createElement("div", {
      className: prefix`none`
    }, locale === null || locale === void 0 ? void 0 : locale.noResultsText);
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils2.mergeRefs)(overlay, speakerRef),
      autoWidth: popupAutoWidth,
      className: classes,
      style: popupStyle,
      onKeyDown: onPickerKeyDown,
      target: trigger
    }, searchable && /*#__PURE__*/_react.default.createElement(_SearchBox.default, {
      placeholder: locale === null || locale === void 0 ? void 0 : locale.searchPlaceholder,
      onChange: handleSearch,
      value: searchKeyword,
      inputRef: searchInput
    }), renderListbox ? renderListbox(listbox) : listbox, renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    onEnter: (0, _utils2.createChainedFunction)(initStickyItems, handleEnter, onEnter),
    onExit: (0, _utils2.createChainedFunction)(handleExit, onExit)
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    id: id,
    multiple: true,
    pickerType: "check",
    block: block,
    disabled: disabled,
    appearance: appearance,
    triggerProps: triggerProps,
    ref: trigger,
    placement: placement,
    speaker: renderPopup,
    rootRef: root,
    style: style,
    classPrefix: classPrefix,
    className: className
  }, /*#__PURE__*/_react.default.createElement(_Picker.PickerToggle, (0, _extends2.default)({
    ref: target,
    appearance: appearance,
    disabled: disabled,
    onClean: handleClean,
    onKeyDown: onPickerKeyDown,
    as: toggleAs,
    cleanable: cleanable && !disabled,
    countable: countable,
    hasValue: hasValue,
    active: active,
    placement: placement,
    inputValue: value,
    focusItemValue: focusItemValue,
    size: size
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
CheckPicker.displayName = 'CheckPicker';
var _default = exports.default = CheckPicker;