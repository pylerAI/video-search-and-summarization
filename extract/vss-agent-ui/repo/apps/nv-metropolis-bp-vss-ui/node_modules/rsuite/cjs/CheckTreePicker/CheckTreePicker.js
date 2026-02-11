'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _CheckTreeView = _interopRequireDefault(require("../CheckTree/CheckTreeView"));
var _useTreeValue = _interopRequireDefault(require("../CheckTree/hooks/useTreeValue"));
var _useFlattenTree = _interopRequireDefault(require("../Tree/hooks/useFlattenTree"));
var _useTreeWithChildren = _interopRequireDefault(require("../Tree/hooks/useTreeWithChildren"));
var _useExpandTree = _interopRequireDefault(require("../Tree/hooks/useExpandTree"));
var _useFocusState = _interopRequireDefault(require("./hooks/useFocusState"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _isFunction = _interopRequireDefault(require("lodash/isFunction"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _Picker = require("../internals/Picker");
var _utils2 = require("../CheckTree/utils");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `CheckTreePicker` component is used for selecting multiple options which are organized in a tree structure.
 *
 * @see https://rsuitejs.com/components/check-tree-picker
 */
const CheckTreePicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('CheckTreePicker', props);
  const {
    as,
    id,
    appearance = 'default',
    block,
    cleanable = true,
    countable = true,
    cascade = true,
    className,
    classPrefix = 'picker',
    childrenKey = 'children',
    disabled,
    data = [],
    defaultValue = [],
    defaultExpandAll = false,
    disabledItemValues = [],
    expandItemValues: controlledExpandItemValues,
    defaultExpandItemValues = [],
    placeholder,
    popupClassName,
    popupStyle,
    popupAutoWidth = true,
    placement = 'bottomStart',
    treeHeight = 320,
    toggleAs,
    searchBy,
    searchKeyword,
    showIndentLine,
    searchable = true,
    style,
    size,
    valueKey = 'value',
    value: controlledValue,
    virtualized = false,
    uncheckableItemValues = [],
    locale,
    labelKey = 'label',
    listProps,
    getChildren,
    renderExtraFooter,
    onEnter,
    onChange,
    onClean,
    onExit,
    onSearch,
    onSelect,
    onSelectItem,
    onScroll,
    onExpand,
    renderValue,
    renderTree,
    renderTreeIcon,
    renderTreeNode,
    onCascadeChange,
    ...rest
  } = propsWithDefaults;
  const {
    trigger,
    root,
    target,
    overlay,
    list,
    searchInput,
    treeView
  } = (0, _Picker.usePickerRef)(ref);
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const [value, setValue] = (0, _useTreeValue.default)(controlledValue, {
    defaultValue,
    uncheckableItemValues
  });
  const itemDataKeys = {
    childrenKey,
    labelKey,
    valueKey
  };
  const {
    treeData,
    loadingNodeValues,
    appendChild
  } = (0, _useTreeWithChildren.default)(data, itemDataKeys);
  const {
    expandItemValues,
    handleExpandTreeNode
  } = (0, _useExpandTree.default)(data, {
    ...itemDataKeys,
    defaultExpandAll,
    defaultExpandItemValues,
    controlledExpandItemValues,
    onExpand,
    getChildren,
    appendChild
  });
  const flattenedNodes = (0, _useFlattenTree.default)(treeData, {
    ...itemDataKeys,
    uncheckableItemValues,
    disabledItemValues,
    multiple: true,
    cascade,
    value
  });
  const selectedNodes = (0, _utils2.getSelectedItems)(flattenedNodes, value);
  const {
    register,
    focusFirstNode
  } = (0, _TreeProvider.useTreeImperativeHandle)();
  const {
    focusItemValue,
    setFocusItemValue,
    active,
    triggerProps
  } = (0, _useFocusState.default)({
    target,
    onEnter,
    onExit
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    const target = event.target;
    // exclude searchbox
    if (target.matches('input[role="searchbox"]') || disabled || !cleanable) {
      return;
    }
    setFocusItemValue(null);
    setValue([]);
    onChange === null || onChange === void 0 || onChange([], event);
    onCascadeChange === null || onCascadeChange === void 0 || onCascadeChange([], event);
  });
  const handleTreeKeyDown = (0, _hooks.useEventCallback)(event => {
    (0, _Picker.onMenuKeyDown)(event, {
      del: handleClean,
      down: () => focusFirstNode()
    });
  });
  const onPickerKeydown = (0, _Picker.useToggleKeyDownEvent)({
    toggle: !focusItemValue || !active,
    trigger,
    target,
    overlay,
    searchInput,
    active,
    onExit: handleClean,
    onMenuKeyDown: handleTreeKeyDown,
    ...rest
  });

  // transform the parent node value to the leaf node value
  const handleTransValue2Children = (0, _hooks.useEventCallback)(nextSelectedNodes => {
    return nextSelectedNodes.map(node => {
      const currentNode = node.refKey ? flattenedNodes[node.refKey] : null;
      if (currentNode && currentNode[childrenKey] && currentNode[childrenKey].length) {
        const childNodes = currentNode[childrenKey].filter(child => {
          const childValue = child[valueKey];
          return !disabledItemValues.includes(childValue) && !uncheckableItemValues.includes(childValue);
        });
        return handleTransValue2Children(childNodes);
      }
      return node;
    }).flat();
  });
  const handleChangeCascade = (0, _hooks.useEventCallback)((nextValue, event) => {
    if (!cascade) {
      onCascadeChange === null || onCascadeChange === void 0 || onCascadeChange(nextValue, event);
    } else {
      const nextSelectedNodes = (0, _utils2.getSelectedItems)(flattenedNodes, nextValue);
      const childrenNodes = handleTransValue2Children(nextSelectedNodes);
      const childrenValue = childrenNodes.map(node => node[valueKey]);
      onCascadeChange === null || onCascadeChange === void 0 || onCascadeChange(childrenValue, event);
    }
  });
  const handleChange = (0, _hooks.useEventCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
    handleChangeCascade(nextValue, event);
  });
  const treeContext = (0, _react.useMemo)(() => ({
    register,
    props: {
      labelKey,
      valueKey,
      childrenKey,
      virtualized,
      renderTreeIcon,
      renderTreeNode
    }
  }), [childrenKey, labelKey, valueKey, virtualized, register, renderTreeIcon, renderTreeNode]);
  const checkTreeView = /*#__PURE__*/_react.default.createElement(_TreeProvider.TreeProvider, {
    value: treeContext
  }, /*#__PURE__*/_react.default.createElement(_CheckTreeView.default, {
    ref: treeView,
    disabledItemValues: disabledItemValues,
    expandItemValues: expandItemValues,
    uncheckableItemValues: uncheckableItemValues,
    cascade: cascade,
    data: treeData,
    height: treeHeight,
    showIndentLine: showIndentLine,
    listProps: listProps,
    listRef: list,
    locale: locale,
    searchBy: searchBy,
    searchable: searchable,
    searchKeyword: searchKeyword,
    searchInputRef: searchInput,
    onScroll: onScroll,
    onSelect: onSelect,
    onSelectItem: onSelectItem,
    onExpand: handleExpandTreeNode,
    onSearch: onSearch,
    onChange: handleChange,
    onFocusItem: setFocusItemValue,
    value: value,
    loadingNodeValues: loadingNodeValues,
    flattenedNodes: flattenedNodes
  }));
  const renderTreeView = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = (0, _classnames.default)(className, popupClassName, prefix('check-tree-menu'));
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils.mergeRefs)(overlay, speakerRef),
      autoWidth: popupAutoWidth,
      className: classes,
      style: popupStyle,
      onKeyDown: onPickerKeydown,
      target: trigger
    }, renderTree ? renderTree(checkTreeView) : checkTreeView, renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValidValue = selectedNodes.length > 0 || value.length > 0 && (0, _isFunction.default)(renderValue);
  let selectedElement = placeholder;
  if (hasValidValue) {
    selectedElement = /*#__PURE__*/_react.default.createElement(_Picker.SelectedElement, {
      selectedItems: selectedNodes,
      countable: countable,
      valueKey: valueKey,
      labelKey: labelKey,
      childrenKey: childrenKey,
      prefix: prefix,
      cascade: cascade,
      locale: locale,
      badgeSize: size
    });
    if ((0, _isFunction.default)(renderValue)) {
      selectedElement = renderValue(value, selectedNodes, selectedElement);
      if ((0, _isNil.default)(selectedElement)) {
        hasValidValue = false;
      }
    }
  }
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    id: id,
    pickerType: "check-tree",
    block: block,
    disabled: disabled,
    appearance: appearance,
    popupType: "tree",
    multiple: true,
    triggerProps: {
      ...(0, _pick.default)(props, _Picker.triggerPropKeys),
      ...triggerProps
    },
    ref: trigger,
    placement: placement,
    speaker: renderTreeView,
    rootRef: root,
    style: style,
    classPrefix: classPrefix,
    className: className
  }, /*#__PURE__*/_react.default.createElement(_Picker.PickerToggle, (0, _extends2.default)({
    ref: target,
    appearance: appearance,
    onKeyDown: onPickerKeydown,
    onClean: (0, _utils.createChainedFunction)(handleClean, onClean),
    cleanable: cleanable && !disabled,
    countable: countable,
    disabled: disabled,
    as: toggleAs,
    hasValue: hasValidValue,
    active: active,
    placement: placement,
    inputValue: value,
    focusItemValue: focusItemValue,
    size: size
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
CheckTreePicker.displayName = 'CheckTreePicker';
var _default = exports.default = CheckTreePicker;