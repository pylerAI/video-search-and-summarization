'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _clone = _interopRequireDefault(require("lodash/clone"));
var _isArray = _interopRequireDefault(require("lodash/isArray"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _Tag = _interopRequireDefault(require("../Tag"));
var _TextBox = _interopRequireDefault(require("./TextBox"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _useInput = _interopRequireDefault(require("./hooks/useInput"));
var _useData = _interopRequireDefault(require("./hooks/useData"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _utils = require("../internals/Tree/utils");
var _hooks = require("../internals/hooks");
var _constants = require("../internals/constants");
var _InputPickerContext = require("./InputPickerContext");
var _utils2 = require("./utils");
var _utils3 = require("../internals/utils");
var _Picker = require("../internals/Picker");
var _Position = require("../internals/Overlay/Position");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Single item selector with text box input.
 *
 * @see https://rsuitejs.com/components/input-picker
 */
const InputPicker = (0, _utils3.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('InputPicker', props);
  const {
    as,
    appearance = 'default',
    block,
    cleanable = true,
    cacheData = [],
    className,
    classPrefix = 'picker',
    caretAs,
    data: controlledData = [],
    disabled,
    readOnly,
    plaintext,
    defaultValue,
    defaultOpen = false,
    disabledItemValues = [],
    locale,
    toggleAs,
    style,
    size = 'md',
    searchable = true,
    open: controlledOpen,
    placeholder,
    placement = 'bottomStart',
    groupBy,
    popupClassName,
    popupStyle,
    popupAutoWidth = true,
    listboxMaxHeight = 320,
    creatable,
    shouldDisplayCreateOption,
    value: valueProp,
    valueKey = 'value',
    virtualized,
    labelKey = 'label',
    listProps,
    id,
    tabIndex,
    loading,
    label,
    sort,
    renderListbox,
    renderExtraFooter,
    renderValue,
    renderOption,
    renderOptionGroup,
    onEnter,
    onEntered,
    onExit,
    onExited,
    onChange,
    onClean,
    onCreate,
    onSearch,
    onSelect,
    onBlur,
    onFocus,
    searchBy,
    ...rest
  } = propsWithDefaults;
  const {
    multi,
    tagProps,
    trigger,
    disabledOptions,
    onTagRemove,
    renderCheckbox
  } = (0, _InputPickerContext.useTagContext)();
  if (groupBy === valueKey || groupBy === labelKey) {
    throw Error('`groupBy` can not be equal to `valueKey` and `labelKey`');
  }
  const {
    trigger: triggerRef,
    root,
    target,
    overlay,
    list
  } = (0, _Picker.usePickerRef)(ref);
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const [open, setOpen] = (0, _hooks.useControlled)(controlledOpen, defaultOpen);
  const {
    inputRef,
    inputProps,
    focus,
    blur
  } = (0, _useInput.default)({
    multi,
    triggerRef
  });
  const handleDataChange = data => {
    var _data$;
    setFocusItemValue(data === null || data === void 0 || (_data$ = data[0]) === null || _data$ === void 0 ? void 0 : _data$[valueKey]);
  };
  const {
    data,
    dataWithCache,
    newData,
    setNewData
  } = (0, _useData.default)({
    controlledData,
    cacheData,
    onChange: handleDataChange
  });
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(valueProp, multi ? defaultValue || [] : defaultValue);
  const cloneValue = () => multi ? (0, _clone.default)(value) || [] : value;
  const handleClose = (0, _hooks.useEventCallback)(() => {
    var _triggerRef$current, _target$current, _target$current$focus;
    triggerRef === null || triggerRef === void 0 || (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 || _triggerRef$current.close();

    // The focus is on the trigger button after closing
    (_target$current = target.current) === null || _target$current === void 0 || (_target$current$focus = _target$current.focus) === null || _target$current$focus === void 0 || _target$current$focus.call(_target$current);
  });
  const focusItemValueOptions = {
    data: dataWithCache,
    valueKey,
    target: () => overlay.current
  };

  // Used to hover the focuse item  when trigger `onKeydown`
  const {
    focusItemValue,
    setFocusItemValue,
    onKeyDown
  } = (0, _Picker.useFocusItemValue)(multi ? value === null || value === void 0 ? void 0 : value[0] : value, focusItemValueOptions);
  const onSearchCallback = (0, _hooks.useEventCallback)((searchKeyword, filteredData, event) => {
    if (!disabledOptions) {
      var _filteredData$;
      // The first option after filtering is the focus.
      let firstItemValue = filteredData === null || filteredData === void 0 || (_filteredData$ = filteredData[0]) === null || _filteredData$ === void 0 ? void 0 : _filteredData$[valueKey];

      // If there is no value in the option and new options are supported, the search keyword is the first option
      if (!firstItemValue && creatable) {
        firstItemValue = searchKeyword;
      }
      setFocusItemValue(firstItemValue);
    }
    onSearch === null || onSearch === void 0 || onSearch(searchKeyword, event);
  });
  const searchOptions = {
    labelKey,
    searchBy,
    callback: onSearchCallback
  };

  // Use search keywords to filter options.
  const {
    searchKeyword,
    resetSearch,
    checkShouldDisplay,
    handleSearch
  } = (0, _Picker.useSearch)(data, searchOptions);

  // Update the position of the menu when the search keyword and value change
  (0, _react.useEffect)(() => {
    var _triggerRef$current2, _triggerRef$current2$;
    (_triggerRef$current2 = triggerRef.current) === null || _triggerRef$current2 === void 0 || (_triggerRef$current2$ = _triggerRef$current2.updatePosition) === null || _triggerRef$current2$ === void 0 || _triggerRef$current2$.call(_triggerRef$current2);
  }, [searchKeyword, value]);
  const getDataItem = value => {
    // Find active `MenuItem` by `value`
    const activeItem = dataWithCache.find(item => (0, _utils3.shallowEqual)(item[valueKey], value));
    let itemNode = placeholder;
    if (activeItem !== null && activeItem !== void 0 && activeItem[labelKey]) {
      itemNode = activeItem === null || activeItem === void 0 ? void 0 : activeItem[labelKey];
    }
    return {
      isValid: !!activeItem,
      activeItem,
      itemNode
    };
  };

  /**
   * Convert the string of the newly created option into an object.
   */
  const createOption = value => {
    const option = {
      create: true,
      [valueKey]: value,
      [labelKey]: value
    };
    if (groupBy) {
      return {
        [groupBy]: locale === null || locale === void 0 ? void 0 : locale.newItem,
        ...option
      };
    }
    return option;
  };
  const handleChange = (0, _hooks.useEventCallback)((value, event) => {
    onChange === null || onChange === void 0 || onChange(value, event);
  });
  const handleRemoveItemByTag = (0, _hooks.useEventCallback)((tag, event) => {
    event.stopPropagation();
    const val = cloneValue();
    (0, _remove.default)(val, itemVal => (0, _utils3.shallowEqual)(itemVal, tag));
    setValue(val);
    handleChange(val, event);
    onTagRemove === null || onTagRemove === void 0 || onTagRemove(tag, event);
  });
  const handleSelect = (0, _hooks.useEventCallback)((value, item, event) => {
    onSelect === null || onSelect === void 0 || onSelect(value, item, event);
    if (creatable && item.create) {
      delete item.create;
      onCreate === null || onCreate === void 0 || onCreate(value, item, event);
      setNewData(newData.concat(item));
    }
  });

  /**
   * Callback triggered by single selection
   * @param value
   * @param item
   * @param event
   */
  const handleSelectItem = (0, _hooks.useEventCallback)((value, item, event) => {
    setValue(value);
    setFocusItemValue(value);
    resetSearch();
    handleSelect(value, item, event);
    handleChange(value, event);
    handleClose();
  });

  /**
   * Callback triggered by multiple selection
   * @param nextItemValue
   * @param item
   * @param event
   * @param checked
   */
  const handleCheckTag = (0, _hooks.useEventCallback)((nextItemValue, item, event, checked) => {
    const val = cloneValue();
    if (checked) {
      val.push(nextItemValue);
    } else {
      (0, _remove.default)(val, itemVal => (0, _utils3.shallowEqual)(itemVal, nextItemValue));
    }
    setValue(val);
    resetSearch();
    setFocusItemValue(nextItemValue);
    handleSelect(val, item, event);
    handleChange(val, event);
    focus();
  });
  const handleTagKeyPress = (0, _hooks.useEventCallback)(event => {
    // When composing, ignore the keypress event.
    if (event.nativeEvent.isComposing) {
      return;
    }
    const val = cloneValue();
    let newItemValue = focusItemValue || '';

    // In TagInput
    if (multi && disabledOptions) {
      newItemValue = searchKeyword;
    }
    if (!newItemValue || !data) {
      return;
    }

    // If the value is disabled in this option, it is returned.
    if (disabledItemValues !== null && disabledItemValues !== void 0 && disabledItemValues.some(item => item === newItemValue)) {
      return;
    }
    if (!val.some(v => (0, _utils3.shallowEqual)(v, newItemValue))) {
      val.push(newItemValue);
    } else if (!disabledOptions) {
      (0, _remove.default)(val, itemVal => (0, _utils3.shallowEqual)(itemVal, newItemValue));
    }
    let focusItem = data.find(item => (0, _utils3.shallowEqual)(item === null || item === void 0 ? void 0 : item[valueKey], newItemValue));
    if (!focusItem) {
      focusItem = createOption(newItemValue);
    }
    setValue(val);
    resetSearch();
    handleSelect(val, focusItem, event);
    handleChange(val, event);
  });
  const handleMenuItemKeyPress = (0, _hooks.useEventCallback)(event => {
    if (!focusItemValue || !controlledData) {
      return;
    }

    // If the value is disabled in this option, it is returned.
    if (disabledItemValues !== null && disabledItemValues !== void 0 && disabledItemValues.some(item => item === focusItemValue)) {
      return;
    }

    // Find active `MenuItem` by `value`
    let focusItem = data.find(item => (0, _utils3.shallowEqual)(item[valueKey], focusItemValue));

    // FIXME Bad state flow
    if (!focusItem && focusItemValue === searchKeyword) {
      focusItem = createOption(searchKeyword);
    }
    setValue(focusItemValue);
    resetSearch();
    if (focusItem) {
      handleSelect(focusItemValue, focusItem, event);
    }
    handleChange(focusItemValue, event);
    handleClose();
  });

  /**
   * Remove the last item, after pressing the back key on the keyboard.
   * @param event
   */
  const removeLastItem = (0, _hooks.useEventCallback)(event => {
    const target = event === null || event === void 0 ? void 0 : event.target;
    if ((target === null || target === void 0 ? void 0 : target.tagName) !== 'INPUT') {
      focus();
      return;
    }
    if ((target === null || target === void 0 ? void 0 : target.tagName) === 'INPUT' && target !== null && target !== void 0 && target.value) {
      return;
    }
    const val = cloneValue();
    val.pop();
    setValue(val);
    handleChange(val, event);
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    if (disabled) {
      return;
    }

    // When there is a value in the search box and the user presses the delete key on the keyboard,
    // do not trigger clearing
    if (inputRef.current === event.target && searchKeyword !== '') {
      return;
    }
    setValue(null);
    setFocusItemValue(null);
    resetSearch();
    if (multi) {
      handleChange([], event);
    } else {
      handleChange(null, event);
    }
    onClean === null || onClean === void 0 || onClean(event);
  });
  const events = {
    onMenuPressBackspace: multi ? removeLastItem : handleClean,
    onMenuKeyDown: onKeyDown,
    onMenuPressEnter: undefined,
    onKeyDown: undefined
  };
  const handleKeyPress = (0, _hooks.useEventCallback)(event => {
    // When typing a space, create a tag.
    if ((0, _utils3.isOneOf)('Space', trigger) && event.key === _constants.KEY_VALUES.SPACE) {
      handleTagKeyPress(event);
      event.preventDefault();
    }

    // When typing a comma, create a tag.
    if ((0, _utils3.isOneOf)('Comma', trigger) && event.key === _constants.KEY_VALUES.COMMA) {
      handleTagKeyPress(event);
      event.preventDefault();
    }
  });
  if (multi) {
    if ((0, _utils3.isOneOf)('Enter', trigger)) {
      events.onMenuPressEnter = handleTagKeyPress;
    }
    if (creatable) {
      events.onKeyDown = handleKeyPress;
    }
  } else {
    events.onMenuPressEnter = handleMenuItemKeyPress;
  }
  const onPickerKeyDown = (0, _Picker.useToggleKeyDownEvent)({
    trigger: triggerRef,
    target,
    overlay,
    loading,
    ...events,
    ...rest
  });
  const handleExited = (0, _hooks.useEventCallback)(() => {
    setFocusItemValue(multi ? value === null || value === void 0 ? void 0 : value[0] : value);
    resetSearch();
  });
  const handleFocus = (0, _hooks.useEventCallback)(event => {
    if (!readOnly) {
      var _triggerRef$current3;
      setOpen(true);
      (_triggerRef$current3 = triggerRef.current) === null || _triggerRef$current3 === void 0 || _triggerRef$current3.open();
    }
    onFocus === null || onFocus === void 0 || onFocus(event);
  });
  const handleEnter = (0, _hooks.useEventCallback)(() => {
    focus();
    setOpen(true);
  });
  const handleExit = (0, _hooks.useEventCallback)(() => {
    blur();
    setOpen(false);
  });
  const renderListItem = (label, item) => {
    // 'Create option "{0}"' =>  Create option "xxxxx"
    const newLabel = item.create ? /*#__PURE__*/_react.default.createElement("span", null, (0, _utils3.tplTransform)((locale === null || locale === void 0 ? void 0 : locale.createOption) || '', label)) : label;
    return renderOption ? renderOption(newLabel, item) : newLabel;
  };
  const checkValue = () => {
    if (multi) {
      return {
        isValid: false,
        itemNode: null
      };
    }
    const dataItem = getDataItem(value);
    let itemNode = dataItem.itemNode;
    if (!(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue)) {
      itemNode = renderValue(value, dataItem.activeItem, itemNode);
    }
    return {
      isValid: dataItem.isValid,
      itemNode
    };
  };
  const renderMultiValue = () => {
    if (!multi) {
      return null;
    }
    const {
      closable = true,
      onClose,
      ...tagRest
    } = tagProps;
    const tags = value || [];
    const items = [];
    const tagElements = tags.map(tag => {
      const {
        isValid,
        itemNode,
        activeItem
      } = getDataItem(tag);
      items.push(activeItem);
      if (!isValid) {
        return null;
      }
      return /*#__PURE__*/_react.default.createElement(_Tag.default, (0, _extends2.default)({
        role: "option"
      }, tagRest, {
        key: tag,
        size: (0, _utils2.convertSize)(size),
        closable: !disabled && closable && !readOnly && !plaintext,
        title: typeof itemNode === 'string' ? itemNode : undefined,
        onClose: (0, _utils3.createChainedFunction)(handleRemoveItemByTag.bind(null, tag), onClose)
      }), itemNode);
    }).filter(item => item !== null);
    if ((tags.length > 0 || isControlled) && (0, _isFunction.default)(renderValue)) {
      return renderValue(value, items, tagElements);
    }
    return tagElements;
  };
  const renderPopup = (positionProps, speakerRef) => {
    const {
      className,
      left,
      top
    } = positionProps;
    const menuClassPrefix = multi ? 'picker-check-menu' : 'picker-select-menu';
    const classes = merge(className, popupClassName, prefix(multi ? 'check-menu' : 'select-menu'));
    const mergedPopupStyle = (0, _utils3.mergeStyles)((0, _Position.getPositionStyle)(left, top), popupStyle);
    let items = (0, _utils.filterNodesOfTree)(data, checkShouldDisplay);
    if (creatable && (typeof shouldDisplayCreateOption === 'function' ? shouldDisplayCreateOption(searchKeyword, items) : searchKeyword && !items.find(item => item[valueKey] === searchKeyword))) {
      items = [...items, createOption(searchKeyword)];
    }

    // Create a tree structure data when set `groupBy`
    if (groupBy) {
      items = (0, _utils3.getDataGroupBy)(items, groupBy, sort);
    } else if (typeof sort === 'function') {
      items = items.sort(sort(false));
    }
    if (disabledOptions) {
      return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
        ref: (0, _utils3.mergeRefs)(overlay, speakerRef)
      });
    }
    const listbox = items.length ? /*#__PURE__*/_react.default.createElement(_Picker.Listbox, {
      listProps: listProps,
      listRef: list,
      disabledItemValues: disabledItemValues,
      valueKey: valueKey,
      labelKey: labelKey,
      classPrefix: menuClassPrefix,
      listItemClassPrefix: multi ? undefined : `${menuClassPrefix}-item`,
      listItemAs: multi ? _Picker.ListCheckItem : _Picker.ListItem,
      listItemProps: {
        renderCheckbox
      },
      activeItemValues: multi ? value : [value],
      focusItemValue: focusItemValue,
      maxHeight: listboxMaxHeight,
      data: items,
      query: searchKeyword,
      groupBy: groupBy,
      onSelect: multi ? handleCheckTag : handleSelectItem,
      renderOptionGroup: renderOptionGroup,
      renderOption: renderListItem,
      virtualized: virtualized
    }) : /*#__PURE__*/_react.default.createElement("div", {
      className: prefix`none`
    }, locale === null || locale === void 0 ? void 0 : locale.noResultsText);
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils3.mergeRefs)(overlay, speakerRef),
      autoWidth: popupAutoWidth,
      className: classes,
      style: mergedPopupStyle,
      target: triggerRef,
      onKeyDown: onPickerKeyDown
    }, renderListbox ? renderListbox(listbox) : listbox, renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };
  const {
    isValid,
    itemNode
  } = checkValue();
  const tagElements = renderMultiValue();

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   * 3.If renderValue returns null or undefined, hasValue is false.
   */
  const hasSingleValue = !(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue) && !(0, _isNil.default)(itemNode);
  const hasMultiValue = (0, _isArray.default)(value) && value.length > 0 && (0, _isFunction.default)(renderValue) && !(0, _isNil.default)(tagElements);
  const hasValue = multi ? !!(tagElements !== null && tagElements !== void 0 && tagElements.length) || hasMultiValue : isValid || hasSingleValue;
  const searching = !!searchKeyword && open;
  const editable = searchable && !disabled && !loading;
  if (plaintext) {
    const plaintextProps = {};

    // When multiple selection, the tag is displayed in a stack layout.
    if (multi && hasValue) {
      plaintextProps.as = _Stack.default;
      plaintextProps.spacing = 6;
      plaintextProps.wrap = true;
    }
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
      localeKey: "notSelected",
      ref: target
    }, plaintextProps), itemNode || (tagElements !== null && tagElements !== void 0 && tagElements.length ? tagElements : null) || placeholder);
  }
  const placeholderNode = placeholder || (disabledOptions ? null : locale === null || locale === void 0 ? void 0 : locale.placeholder);
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    onEnter: (0, _utils3.createChainedFunction)(handleEnter, onEnter),
    onEntered: onEntered,
    onExit: (0, _utils3.createChainedFunction)(handleExit, onExit),
    onExited: (0, _utils3.createChainedFunction)(handleExited, onExited)
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, (0, _extends2.default)({
    id: id,
    multiple: multi,
    pickerType: multi ? 'tag' : 'input',
    block: block,
    disabled: disabled,
    appearance: appearance,
    as: as,
    triggerProps: triggerProps,
    ref: triggerRef,
    trigger: "active",
    speaker: renderPopup,
    placement: placement,
    rootRef: root,
    style: style,
    size: size,
    classPrefix: classPrefix,
    className: className,
    responsive: searchable === false,
    onClick: focus,
    onKeyDown: onPickerKeyDown,
    "data-focus": open,
    "data-disabled-options": disabledOptions
  }, rest), /*#__PURE__*/_react.default.createElement(_Picker.PickerToggle, {
    loading: loading,
    label: label,
    appearance: appearance,
    readOnly: readOnly,
    plaintext: plaintext,
    ref: target,
    as: toggleAs,
    caretAs: caretAs,
    tabIndex: tabIndex,
    onClean: handleClean,
    cleanable: cleanable && !disabled,
    hasValue: hasValue,
    active: open,
    disabled: disabled,
    placement: placement,
    inputValue: value,
    focusItemValue: focusItemValue,
    caret: !disabledOptions,
    size: size
  }, searching || multi && hasValue ? null : itemNode || placeholderNode), /*#__PURE__*/_react.default.createElement(_TextBox.default, {
    showTagList: multi,
    inputRef: inputRef,
    inputValue: open ? searchKeyword : '',
    inputProps: inputProps,
    tags: tagElements,
    editable: editable,
    readOnly: readOnly,
    disabled: disabled,
    multiple: multi,
    onBlur: onBlur,
    onFocus: handleFocus,
    onChange: handleSearch
  }));
});
InputPicker.displayName = 'InputPicker';
var _default = exports.default = InputPicker;