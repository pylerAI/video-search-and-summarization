'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _TreeView = _interopRequireDefault(require("../MultiCascadeTree/TreeView"));
var _SearchView = _interopRequireDefault(require("../MultiCascadeTree/SearchView"));
var _useActive = _interopRequireDefault(require("../Cascader/useActive"));
var _utils = require("../internals/Tree/utils");
var _hooks = require("../internals/hooks");
var _utils2 = require("../CascadeTree/utils");
var _utils3 = require("../internals/utils");
var _hooks2 = require("../MultiCascadeTree/hooks");
var _Picker = require("../internals/Picker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];

/**
 * The `MultiCascader` component is used to select multiple values from cascading options.
 * @see https://rsuitejs.com/components/multi-cascader/
 */
const MultiCascader = (0, _utils3.forwardRef)((props, ref) => {
  var _selectedPaths;
  const {
    propsWithDefaults,
    rtl
  } = (0, _hooks.useCustom)('MultiCascader', props);
  const {
    as,
    appearance = 'default',
    block,
    className,
    cleanable = true,
    classPrefix = 'picker',
    columnHeight,
    columnWidth,
    childrenKey = 'children',
    countable = true,
    cascade = true,
    data = emptyArray,
    defaultValue,
    disabled,
    disabledItemValues = emptyArray,
    id,
    labelKey = 'label',
    locale,
    placeholder,
    placement = 'bottomStart',
    popupClassName,
    popupStyle,
    renderColumn,
    renderExtraFooter,
    renderTreeNode,
    renderValue,
    searchable = true,
    style,
    size,
    toggleAs,
    uncheckableItemValues = emptyArray,
    value: valueProp,
    valueKey = 'value',
    getChildren,
    onClean,
    onChange,
    onCheck,
    onEnter,
    onExit,
    onSearch,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const {
    trigger,
    root,
    target,
    overlay,
    searchInput
  } = (0, _Picker.usePickerRef)(ref);
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const onSelectCallback = (0, _react.useCallback)((node, cascadePaths, event) => {
    var _trigger$current, _trigger$current$upda;
    onSelect === null || onSelect === void 0 || onSelect(node, cascadePaths, event);
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || (_trigger$current$upda = _trigger$current.updatePosition) === null || _trigger$current$upda === void 0 || _trigger$current$upda.call(_trigger$current);
  }, [onSelect, trigger]);
  const {
    selectedPaths,
    flattenData,
    columnData,
    setColumnData,
    setSelectedPaths,
    handleSelect
  } = (0, _hooks2.useSelect)({
    data,
    childrenKey,
    labelKey,
    valueKey,
    onSelect: onSelectCallback,
    getChildren
  });
  const [controlledValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const itemKeys = {
    childrenKey,
    labelKey,
    valueKey
  };
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
    setValue,
    handleCheck
  } = (0, _hooks2.useCascadeValue)(cascadeValueProps, flattenData);
  const selectedItems = flattenData.filter(item => value.some(v => v === item[valueKey])) || [];
  const onFocusItemCallback = (0, _react.useCallback)(value => {
    const {
      columns,
      path
    } = (0, _utils2.getColumnsAndPaths)(data, flattenData.find(item => item[valueKey] === value), {
      getParent: () => undefined,
      getChildren: item => item[childrenKey]
    });
    setColumnData(columns);
    setSelectedPaths(path);
  }, [childrenKey, data, flattenData, setColumnData, setSelectedPaths, valueKey]);

  // Used to hover the focuse item  when trigger `onKeydown`
  const {
    focusItemValue,
    setLayer,
    setKeys,
    onKeyDown: onFocusItem
  } = (0, _Picker.useFocusItemValue)(selectedPaths === null || selectedPaths === void 0 || (_selectedPaths = selectedPaths[selectedPaths.length - 1]) === null || _selectedPaths === void 0 ? void 0 : _selectedPaths[valueKey], {
    rtl,
    data: flattenData,
    valueKey,
    defaultLayer: selectedPaths !== null && selectedPaths !== void 0 && selectedPaths.length ? selectedPaths.length - 1 : 0,
    target: () => overlay.current,
    callback: onFocusItemCallback
  });
  const onSearchCallback = (value, event) => {
    if (value) {
      setLayer(0);
    } else if (selectedPaths !== null && selectedPaths !== void 0 && selectedPaths.length) {
      setLayer(selectedPaths.length - 1);
    }
    setKeys([]);
    onSearch === null || onSearch === void 0 || onSearch(value, event);
  };
  const {
    items,
    searchKeyword,
    setSearchKeyword,
    handleSearch
  } = (0, _hooks2.useSearch)({
    labelKey,
    valueKey,
    childrenKey,
    flattenedData: flattenData,
    uncheckableItemValues,
    onSearch: onSearchCallback
  });
  const {
    active,
    events
  } = (0, _useActive.default)({
    onEnter,
    onExit,
    target,
    setSearchKeyword
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    if (disabled || !target.current) {
      return;
    }
    setSelectedPaths([]);
    setValue([]);
    setColumnData([data]);
    onChange === null || onChange === void 0 || onChange([], event);
  });
  const handleMenuPressEnter = (0, _hooks.useEventCallback)(event => {
    var _overlay$current;
    const focusItem = (0, _utils.findNodeOfTree)(data, item => item[valueKey] === focusItemValue);
    const checkbox = (_overlay$current = overlay.current) === null || _overlay$current === void 0 ? void 0 : _overlay$current.querySelector(`[data-key="${focusItemValue}"] [type="checkbox"]`);
    if (checkbox) {
      handleCheck(focusItem, event, (checkbox === null || checkbox === void 0 ? void 0 : checkbox.getAttribute('aria-checked')) !== 'true');
    }
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
  const renderCascadeColumn = (childNodes, column) => {
    if (typeof renderColumn === 'function') {
      return renderColumn(childNodes, column);
    }
    return childNodes;
  };
  const renderCascadeTreeNode = (node, itemData) => {
    if (typeof renderTreeNode === 'function') {
      return renderTreeNode(node, itemData);
    }
    return node;
  };
  const renderTreeView = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps || {};
    const classes = merge(className, popupClassName, prefix('popup-multi-cascader'));
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils3.mergeRefs)(overlay, speakerRef),
      className: classes,
      style: popupStyle,
      target: trigger,
      onKeyDown: onPickerKeyDown
    }, searchable && /*#__PURE__*/_react.default.createElement(_SearchView.default, {
      locale: locale,
      cascade: cascade,
      data: items,
      value: value,
      searchKeyword: searchKeyword,
      valueKey: valueKey,
      labelKey: labelKey,
      childrenKey: childrenKey,
      disabledItemValues: disabledItemValues,
      inputRef: searchInput,
      onCheck: handleCheck,
      onSearch: handleSearch
    }), !searchKeyword && /*#__PURE__*/_react.default.createElement(_TreeView.default, {
      cascade: cascade,
      columnWidth: columnWidth,
      columnHeight: columnHeight,
      classPrefix: "cascade-tree",
      uncheckableItemValues: uncheckableItemValues,
      disabledItemValues: disabledItemValues,
      valueKey: valueKey,
      labelKey: labelKey,
      childrenKey: childrenKey,
      cascadeData: columnData,
      cascadePaths: selectedPaths,
      value: value,
      onSelect: handleSelect,
      onCheck: handleCheck,
      renderColumn: renderCascadeColumn,
      renderTreeNode: renderCascadeTreeNode
    }), renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };
  let selectedElement = placeholder;
  if (selectedItems.length > 0) {
    selectedElement = /*#__PURE__*/_react.default.createElement(_Picker.SelectedElement, {
      selectedItems: selectedItems,
      countable: countable,
      valueKey: valueKey,
      labelKey: labelKey,
      childrenKey: childrenKey,
      prefix: prefix,
      cascade: cascade,
      locale: locale,
      badgeSize: size
    });
  }

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValue = selectedItems.length > 0 || Number(valueProp === null || valueProp === void 0 ? void 0 : valueProp.length) > 0 && (0, _isFunction.default)(renderValue);
  if (hasValue && (0, _isFunction.default)(renderValue)) {
    selectedElement = renderValue(value.length ? value : valueProp !== null && valueProp !== void 0 ? valueProp : [], selectedItems, selectedElement);
    // If renderValue returns null or undefined, hasValue is false.
    if ((0, _isNil.default)(selectedElement)) {
      hasValue = false;
    }
  }
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    ...events
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    id: id,
    pickerType: "multi-cascader",
    block: block,
    disabled: disabled,
    appearance: appearance,
    popupType: "tree",
    multiple: true,
    triggerProps: triggerProps,
    ref: trigger,
    placement: placement,
    speaker: renderTreeView,
    rootRef: root,
    style: style,
    classPrefix: classPrefix,
    className: className
  }, /*#__PURE__*/_react.default.createElement(_Picker.PickerToggle, (0, _extends2.default)({
    ref: target,
    as: toggleAs,
    appearance: appearance,
    disabled: disabled,
    onClean: (0, _utils3.createChainedFunction)(handleClean, onClean),
    onKeyDown: onPickerKeyDown,
    cleanable: cleanable && !disabled,
    countable: countable,
    hasValue: hasValue,
    active: active,
    placement: placement,
    inputValue: value,
    size: size
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
MultiCascader.displayName = 'MultiCascader';
var _default = exports.default = MultiCascader;