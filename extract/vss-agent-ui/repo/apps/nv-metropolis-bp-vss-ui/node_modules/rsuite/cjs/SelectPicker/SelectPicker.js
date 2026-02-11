'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _SearchBox = _interopRequireDefault(require("../internals/SearchBox"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _Picker = require("../internals/Picker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];
/**
 * The `SelectPicker` component is used to select an item from a list of data.
 * @see https://rsuitejs.com/components/select-picker/
 */
const SelectPicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('SelectPicker', props);
  const {
    appearance = 'default',
    as,
    block,
    className,
    cleanable = true,
    classPrefix = 'picker',
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
    style,
    toggleAs,
    value: valueProp,
    valueKey = 'value',
    virtualized,
    sort,
    searchBy,
    renderValue,
    renderListbox,
    renderOptionGroup,
    renderOption,
    renderExtraFooter,
    onGroupTitleClick,
    onEnter,
    onExit,
    onClean,
    onChange,
    onSelect,
    onSearch,
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
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);

  // Used to hover the focus item  when trigger `onKeydown`
  const {
    focusItemValue,
    setFocusItemValue,
    onKeyDown: onFocusItem
  } = (0, _Picker.useFocusItemValue)(value, {
    data,
    valueKey,
    target: () => overlay.current
  });

  // Use search keywords to filter options.
  const {
    searchKeyword,
    filteredData,
    resetSearch,
    handleSearch
  } = (0, _Picker.useSearch)(data, {
    labelKey,
    searchBy,
    callback: (searchKeyword, filteredData, event) => {
      var _filteredData$;
      // The first option after filtering is the focus.
      setFocusItemValue(filteredData === null || filteredData === void 0 || (_filteredData$ = filteredData[0]) === null || _filteredData$ === void 0 ? void 0 : _filteredData$[valueKey]);
      onSearch === null || onSearch === void 0 || onSearch(searchKeyword, event);
    }
  });

  // Use component active state to support keyboard events.
  const [active, setActive] = (0, _react.useState)(false);
  const handleClose = (0, _hooks.useEventCallback)(() => {
    var _trigger$current, _trigger$current$clos;
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || (_trigger$current$clos = _trigger$current.close) === null || _trigger$current$clos === void 0 || _trigger$current$clos.call(_trigger$current);
  });
  const handleSelect = (0, _hooks.useEventCallback)((value, item, event) => {
    var _target$current;
    onSelect === null || onSelect === void 0 || onSelect(value, item, event);
    (_target$current = target.current) === null || _target$current === void 0 || _target$current.focus();
  });
  const handleChangeValue = (0, _hooks.useEventCallback)((value, event) => {
    onChange === null || onChange === void 0 || onChange(value, event);
  });
  const handleMenuPressEnter = (0, _hooks.useEventCallback)(event => {
    if (!focusItemValue) {
      return;
    }

    // Find active `MenuItem` by `value`
    const focusItem = data.find(item => (0, _utils.shallowEqual)(item[valueKey], focusItemValue));
    setValue(focusItemValue);
    handleSelect(focusItemValue, focusItem, event);
    handleChangeValue(focusItemValue, event);
    handleClose();
  });
  const handleItemSelect = (0, _hooks.useEventCallback)((value, item, event) => {
    setValue(value);
    setFocusItemValue(value);
    handleSelect(value, item, event);
    handleChangeValue(value, event);
    handleClose();
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    if (disabled || !cleanable) {
      return;
    }
    setValue(null);
    setFocusItemValue(value);
    handleChangeValue(null, event);
  });
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
    ...rest
  });
  const handleExit = (0, _hooks.useEventCallback)(() => {
    resetSearch();
    setActive(false);
    onSearch === null || onSearch === void 0 || onSearch('');
    setFocusItemValue(null);
  });
  const handleEnter = (0, _hooks.useEventCallback)(() => {
    setActive(true);
    setFocusItemValue(value);
  });

  // Find active `MenuItem` by `value`
  const activeItem = data.find(item => (0, _utils.shallowEqual)(item[valueKey], value));

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValue = !!activeItem || !(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue);
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  let selectedElement = placeholder;
  if (activeItem !== null && activeItem !== void 0 && activeItem[labelKey]) {
    selectedElement = activeItem[labelKey];
  }
  if (!(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue)) {
    selectedElement = renderValue(value, activeItem, selectedElement);
    // If renderValue returns null or undefined, hasValue is false.
    if ((0, _isNil.default)(selectedElement)) {
      hasValue = false;
    }
  }
  const renderPopup = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(className, popupClassName, prefix('select-menu'));
    let items = filteredData;

    // Create a tree structure data when set `groupBy`
    if (groupBy) {
      items = (0, _utils.getDataGroupBy)(items, groupBy, sort);
    } else if (typeof sort === 'function') {
      items = items.sort(sort(false));
    }
    const listbox = items.length ? /*#__PURE__*/_react.default.createElement(_Picker.Listbox, {
      listProps: listProps,
      listRef: list,
      disabledItemValues: disabledItemValues,
      valueKey: valueKey,
      labelKey: labelKey,
      renderOptionGroup: renderOptionGroup,
      renderOption: renderOption,
      maxHeight: listboxMaxHeight,
      classPrefix: 'picker-select-menu',
      listItemClassPrefix: 'picker-select-menu-item',
      listItemAs: _Picker.ListItem,
      activeItemValues: [value],
      focusItemValue: focusItemValue,
      data: items,
      query: searchKeyword,
      groupBy: groupBy,
      onSelect: handleItemSelect,
      onGroupTitleClick: onGroupTitleClick,
      virtualized: virtualized
    }) : /*#__PURE__*/_react.default.createElement("div", {
      className: prefix`none`
    }, locale === null || locale === void 0 ? void 0 : locale.noResultsText);
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils.mergeRefs)(overlay, speakerRef),
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
    onEnter: (0, _utils.createChainedFunction)(handleEnter, onEnter),
    onExit: (0, _utils.createChainedFunction)(handleExit, onExit)
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    id: id,
    pickerType: "select",
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
    onClean: (0, _utils.createChainedFunction)(handleClean, onClean),
    onKeyDown: onPickerKeyDown,
    as: toggleAs,
    disabled: disabled,
    cleanable: cleanable && !disabled,
    hasValue: hasValue,
    inputValue: value !== null && value !== void 0 ? value : '',
    focusItemValue: focusItemValue,
    active: active,
    placement: placement
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
SelectPicker.displayName = 'SelectPicker';
var _default = exports.default = SelectPicker;