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
var _useTreeWithChildren = _interopRequireDefault(require("../Tree/hooks/useTreeWithChildren"));
var _useFlattenTree = _interopRequireDefault(require("../Tree/hooks/useFlattenTree"));
var _useFocusState = _interopRequireDefault(require("./hooks/useFocusState"));
var _useExpandTree = _interopRequireDefault(require("../Tree/hooks/useExpandTree"));
var _TreeView = _interopRequireDefault(require("../Tree/TreeView"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _utils2 = require("../Tree/utils");
var _Picker = require("../internals/Picker");
var _utils3 = require("../internals/Tree/utils");
var _TreeProvider = require("../internals/Tree/TreeProvider");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `TreePicker` component is used for selecting single options which are organized in a tree structure.
 *
 * @see https://rsuitejs.com/components/tree-picker/
 */
const TreePicker = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('TreePicker', props);
  const {
    as,
    appearance = 'default',
    classPrefix = 'picker',
    cleanable = true,
    childrenKey = 'children',
    data = [],
    disabled,
    defaultValue,
    defaultExpandAll = false,
    disabledItemValues = [],
    defaultExpandItemValues = [],
    expandItemValues: controlledExpandItemValues,
    id,
    block,
    className,
    locale,
    labelKey = 'label',
    onlyLeafSelectable,
    placeholder,
    placement = 'bottomStart',
    style,
    searchKeyword,
    searchable = true,
    showIndentLine,
    popupClassName,
    popupStyle,
    popupAutoWidth = true,
    treeHeight = 320,
    valueKey = 'value',
    virtualized = false,
    value: controlledValue,
    listProps,
    toggleAs,
    searchBy,
    getChildren,
    onClean,
    onSearch,
    onSelect,
    onSelectItem,
    onChange,
    onExpand,
    onEnter,
    onExit,
    onEntered,
    renderValue,
    renderTree,
    renderTreeIcon,
    renderTreeNode,
    renderExtraFooter,
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
  const [value, setValue] = (0, _hooks.useControlled)(controlledValue, defaultValue);
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
  const flattenedNodes = (0, _useFlattenTree.default)(treeData, {
    ...itemDataKeys
  });
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
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const activeNode = (0, _utils2.getTreeActiveNode)(flattenedNodes, value, valueKey);
  const {
    register,
    focusFirstNode,
    focusActiveNode
  } = (0, _TreeProvider.useTreeImperativeHandle)();
  const {
    active,
    focusItemValue,
    setFocusItemValue,
    triggerProps
  } = (0, _useFocusState.default)({
    focusActiveNode,
    target,
    value,
    onEnter,
    onExit,
    onEntered
  });
  const handleSelect = (0, _hooks.useEventCallback)((treeNode, value, event) => {
    var _target$current, _trigger$current, _trigger$current$clos;
    onSelect === null || onSelect === void 0 || onSelect(treeNode, value, event);

    // Only leaf nodes can update the value and close the picker.
    if (onlyLeafSelectable && !(0, _utils3.isLeafNode)(treeNode)) {
      return;
    }
    setFocusItemValue(value);
    handleChange(value, event);
    (_target$current = target.current) === null || _target$current === void 0 || _target$current.focus();
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || (_trigger$current$clos = _trigger$current.close) === null || _trigger$current$clos === void 0 || _trigger$current$clos.call(_trigger$current);
  });
  const handleClean = (0, _hooks.useEventCallback)(event => {
    const target = event.target;
    // exclude searchbox
    if (target.matches('input[role="searchbox"]') || disabled || !cleanable) {
      return;
    }
    setValue(null);
    onChange === null || onChange === void 0 || onChange(null, event);
  });
  const handleTreePressEnter = (0, _hooks.useEventCallback)(event => {
    if ((0, _isNil.default)(focusItemValue)) {
      return;
    }
    const activeItem = (0, _utils2.getActiveItem)(focusItemValue, flattenedNodes, valueKey);
    handleSelect(activeItem, focusItemValue, event);
  });
  const handleTreeKeyDown = (0, _hooks.useEventCallback)(event => {
    (0, _Picker.onMenuKeyDown)(event, {
      del: handleClean,
      down: () => focusFirstNode(),
      enter: handleTreePressEnter
    });
  });
  const onPickerKeydown = (0, _Picker.useToggleKeyDownEvent)({
    toggle: !activeNode || !active,
    trigger,
    target,
    overlay,
    searchInput,
    active,
    onExit: handleClean,
    onMenuKeyDown: handleTreeKeyDown,
    ...rest
  });
  const handleChange = (0, _hooks.useEventCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
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
  const tree = /*#__PURE__*/_react.default.createElement(_TreeProvider.TreeProvider, {
    value: treeContext
  }, /*#__PURE__*/_react.default.createElement(_TreeView.default, {
    ref: treeView,
    value: value,
    data: treeData,
    disabledItemValues: disabledItemValues,
    expandItemValues: expandItemValues,
    showIndentLine: showIndentLine,
    searchable: searchable,
    searchKeyword: searchKeyword,
    searchBy: searchBy,
    searchInputRef: searchInput,
    loadingNodeValues: loadingNodeValues,
    flattenedNodes: flattenedNodes,
    listProps: listProps,
    listRef: list,
    locale: locale,
    height: treeHeight,
    onExpand: handleExpandTreeNode,
    onSearch: onSearch,
    onSelect: handleSelect,
    onSelectItem: onSelectItem,
    onFocusItem: setFocusItemValue
  }));
  const renderTreeView = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(className, popupClassName, prefix('tree-menu'));
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      autoWidth: popupAutoWidth,
      className: classes,
      style: popupStyle,
      ref: (0, _utils.mergeRefs)(overlay, speakerRef),
      onKeyDown: onPickerKeydown,
      target: trigger
    }, renderTree ? renderTree(tree) : tree, renderExtraFooter === null || renderExtraFooter === void 0 ? void 0 : renderExtraFooter());
  };

  /**
   * 1.Have a value and the value is valid.
   * 2.Regardless of whether the value is valid, as long as renderValue is set, it is judged to have a value.
   */
  let hasValidValue = !(0, _isNil.default)(activeNode) || !(0, _isNil.default)(value) && (0, _isFunction.default)(renderValue);
  let selectedElement = placeholder;
  if (hasValidValue) {
    const node = activeNode !== null && activeNode !== void 0 ? activeNode : {};
    selectedElement = node[labelKey];
    if ((0, _isFunction.default)(renderValue) && value) {
      selectedElement = renderValue(value, node, selectedElement);
      if ((0, _isNil.default)(selectedElement)) {
        hasValidValue = false;
      }
    }
  }
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, {
    as: as,
    id: id,
    pickerType: "tree",
    block: block,
    disabled: disabled,
    appearance: appearance,
    popupType: "tree",
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
    as: toggleAs,
    disabled: disabled,
    hasValue: hasValidValue,
    active: active,
    placement: placement,
    inputValue: value,
    focusItemValue: focusItemValue
  }, rest), selectedElement || (locale === null || locale === void 0 ? void 0 : locale.placeholder)));
});
TreePicker.displayName = 'TreePicker';
var _default = exports.default = TreePicker;