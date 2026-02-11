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
var _TreeView = _interopRequireDefault(require("../CascadeTree/TreeView"));
var _SearchView = _interopRequireDefault(require("../CascadeTree/SearchView"));
var _hooks = require("../CascadeTree/hooks");
var _utils = require("../Tree/utils");
var _utils2 = require("../internals/Tree/utils");
var _hooks2 = require("../internals/hooks");
var _utils3 = require("../internals/utils");
var _Picker = require("../internals/Picker");
var _useActive = _interopRequireDefault(require("./useActive"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];
/**
 * The `Cascader` component displays a hierarchical list of options.
 * @see https://rsuitejs.com/components/cascader
 */
const Cascader = (0, _utils3.forwardRef)((props, ref) => {
  const {
    rtl,
    propsWithDefaults
  } = (0, _hooks2.useCustom)('Cascader', props);
  const {
    appearance = 'default',
    as,
    block,
    className,
    cleanable = true,
    classPrefix = 'picker',
    columnHeight,
    columnWidth,
    data = emptyArray,
    defaultValue,
    disabled,
    disabledItemValues = emptyArray,
    childrenKey = 'children',
    id,
    labelKey = 'label',
    locale,
    parentSelectable,
    placeholder,
    placement = 'bottomStart',
    popupClassName,
    popupStyle,
    renderColumn,
    renderExtraFooter,
    renderSearchItem,
    renderTreeNode,
    renderValue,
    searchable = true,
    style,
    toggleAs,
    value: valueProp,
    valueKey = 'value',
    onClean,
    onChange,
    onEnter,
    onExit,
    onSearch,
    onSelect,
    getChildren,
    ...rest
  } = propsWithDefaults;
  const {
    trigger,
    root,
    target,
    overlay,
    searchInput
  } = (0, _Picker.usePickerRef)(ref);
  const [value, setValue] = (0, _hooks2.useControlled)(valueProp, defaultValue);

  // Store the children of each node
  const childrenMap = (0, _hooks2.useMap)();

  // Store the parent of each node
  const parentMap = (0, _react.useMemo)(() => (0, _utils2.getParentMap)(data, item => {
    var _childrenMap$get;
    return (_childrenMap$get = childrenMap.get(item)) !== null && _childrenMap$get !== void 0 ? _childrenMap$get : item[childrenKey];
  }), [childrenMap, childrenKey, data]);

  // Flatten the tree data
  const flattenedData = (0, _react.useMemo)(() => (0, _utils.flattenTree)(data, item => {
    var _childrenMap$get2;
    return (_childrenMap$get2 = childrenMap.get(item)) !== null && _childrenMap$get2 !== void 0 ? _childrenMap$get2 : item[childrenKey];
  }), [childrenMap, childrenKey, data]);

  // The selected item
  const selectedItem = flattenedData.find(item => item[valueKey] === value);

  // Callback function after selecting the node
  const onSelectCallback = (node, event) => {
    var _trigger$current;
    const {
      isLeafNode,
      cascadePaths,
      itemData
    } = node;
    onSelect === null || onSelect === void 0 || onSelect(itemData, cascadePaths, event);
    const nextValue = itemData[valueKey];
    if (isLeafNode) {
      // Determines whether the option is a leaf node, and if so, closes the picker.
      handleClose();
      setValue(nextValue);
      return;
    }

    //  When the parent is optional, the value and the displayed path are updated.
    if (parentSelectable && !(0, _utils3.shallowEqual)(value, nextValue)) {
      setValue(nextValue);
      onChange === null || onChange === void 0 || onChange(nextValue, event);
    }

    // Update menu position
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || _trigger$current.updatePosition();
  };
  const {
    activeItem,
    setActiveItem,
    loadingItemsSet,
    handleSelect
  } = (0, _hooks.useSelect)({
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
    pathTowardsActiveItem,
    pathTowardsSelectedItem
  } = (0, _hooks.usePaths)({
    data,
    activeItem,
    selectedItem,
    getParent: item => parentMap.get(item),
    getChildren: item => {
      var _childrenMap$get3;
      return (_childrenMap$get3 = childrenMap.get(item)) !== null && _childrenMap$get3 !== void 0 ? _childrenMap$get3 : item[childrenKey];
    }
  });

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValue = pathTowardsSelectedItem.length > 0 || !(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue);
  const {
    prefix,
    merge
  } = (0, _hooks2.useStyles)(classPrefix);
  const onFocusItemCallback = (0, _react.useCallback)(value => {
    setActiveItem(flattenedData.find(item => item[valueKey] === value));
  }, [flattenedData, setActiveItem, valueKey]);

  // Used to hover the focuse item  when trigger `onKeydown`
  const {
    focusItemValue,
    setFocusItemValue,
    setLayer,
    setKeys,
    onKeyDown: onFocusItem
  } = (0, _Picker.useFocusItemValue)(value, {
    rtl,
    data: flattenedData,
    valueKey,
    defaultLayer: pathTowardsSelectedItem !== null && pathTowardsSelectedItem !== void 0 && pathTowardsSelectedItem.length ? pathTowardsSelectedItem.length - 1 : 0,
    target: () => overlay.current,
    getParent: item => parentMap.get(item),
    callback: onFocusItemCallback
  });
  const onSearchCallback = (value, items, event) => {
    onSearch === null || onSearch === void 0 || onSearch(value, event);
    if (!value || items.length === 0) {
      setFocusItemValue(undefined);
      return;
    }
    if (items.length > 0) {
      setFocusItemValue(items[0][valueKey]);
      setLayer(0);
      setKeys([]);
    }
  };
  const {
    items,
    searchKeyword,
    setSearchKeyword,
    handleSearch
  } = (0, _hooks.useSearch)({
    labelKey,
    childrenKey,
    parentMap,
    flattenedData,
    parentSelectable,
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
  const handleClose = (0, _hooks2.useEventCallback)(() => {
    var _trigger$current2, _target$current, _target$current$focus;
    (_trigger$current2 = trigger.current) === null || _trigger$current2 === void 0 || _trigger$current2.close();

    // The focus is on the trigger button after closing
    (_target$current = target.current) === null || _target$current === void 0 || (_target$current$focus = _target$current.focus) === null || _target$current$focus === void 0 || _target$current$focus.call(_target$current);
  });
  const handleClean = (0, _hooks2.useEventCallback)(event => {
    if (disabled || !target.current) {
      return;
    }
    setValue(null);
    onChange === null || onChange === void 0 || onChange(null, event);
  });
  const handleMenuPressEnter = (0, _hooks2.useEventCallback)(event => {
    const focusItem = (0, _utils2.findNodeOfTree)(data, item => item[valueKey] === focusItemValue);
    const isLeafNode = focusItem && !focusItem[childrenKey];
    if (isLeafNode) {
      setValue(focusItemValue);
      if (pathTowardsActiveItem.length) {
        setLayer(pathTowardsActiveItem.length - 1);
      }
      if (!(0, _utils3.shallowEqual)(value, focusItemValue)) {
        onSelect === null || onSelect === void 0 || onSelect(focusItem, pathTowardsActiveItem, event);
        onChange === null || onChange === void 0 || onChange(focusItemValue !== null && focusItemValue !== void 0 ? focusItemValue : null, event);
      }
      handleClose();
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

  /**
   * The search structure option is processed after being selected.
   */
  const handleSearchRowSelect = (0, _hooks2.useEventCallback)((itemData, nodes, event) => {
    const nextValue = itemData[valueKey];
    handleClose();
    setSearchKeyword('');
    setValue(nextValue);
    onSelect === null || onSelect === void 0 || onSelect(itemData, nodes, event);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
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
    const classes = merge(className, popupClassName, prefix('popup-cascader'));
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils3.mergeRefs)(overlay, speakerRef),
      className: classes,
      style: popupStyle,
      target: trigger,
      onKeyDown: onPickerKeyDown
    }, searchable && /*#__PURE__*/_react.default.createElement(_SearchView.default, {
      data: items,
      searchKeyword: searchKeyword,
      valueKey: valueKey,
      labelKey: labelKey,
      locale: locale,
      parentMap: parentMap,
      disabledItemValues: disabledItemValues,
      focusItemValue: focusItemValue,
      inputRef: searchInput,
      renderSearchItem: renderSearchItem,
      onSelect: handleSearchRowSelect,
      onSearch: handleSearch
    }), searchKeyword === '' && /*#__PURE__*/_react.default.createElement(_TreeView.default, {
      columnWidth: columnWidth,
      columnHeight: columnHeight,
      disabledItemValues: disabledItemValues,
      loadingItemsSet: loadingItemsSet,
      valueKey: valueKey,
      labelKey: labelKey,
      childrenKey: childrenKey,
      classPrefix: 'cascade-tree',
      data: columns,
      cascadePaths: pathTowardsActiveItem,
      activeItemValue: value,
      onSelect: handleSelect,
      renderColumn: renderCascadeColumn,
      renderTreeNode: renderCascadeTreeNode
    }), renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };
  let selectedElement = placeholder;
  if (pathTowardsSelectedItem.length > 0) {
    selectedElement = [];
    pathTowardsSelectedItem.forEach((item, index) => {
      const key = item[valueKey] || item[labelKey];
      selectedElement.push(/*#__PURE__*/_react.default.createElement("span", {
        key: key
      }, item[labelKey]));
      if (index < pathTowardsSelectedItem.length - 1) {
        selectedElement.push(/*#__PURE__*/_react.default.createElement("span", {
          className: "separator",
          key: `${key}-separator`
        }, ' / '));
      }
    });
  }
  if (!(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue)) {
    selectedElement = renderValue(value, pathTowardsSelectedItem, selectedElement);
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
    pickerType: "cascader",
    block: block,
    disabled: disabled,
    appearance: appearance,
    popupType: "tree",
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
    hasValue: hasValue,
    active: active,
    placement: placement,
    inputValue: value !== null && value !== void 0 ? value : '',
    focusItemValue: focusItemValue
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
Cascader.displayName = 'Cascader';
var _default = exports.default = Cascader;