'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Spinner = _interopRequireDefault(require("@rsuite/icons/Spinner"));
var _ArrowLeftLine = _interopRequireDefault(require("@rsuite/icons/ArrowLeftLine"));
var _ArrowRightLine = _interopRequireDefault(require("@rsuite/icons/ArrowRightLine"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _Picker = require("../internals/Picker");
var _utils2 = require("./utils");
const emptyArray = [];
const TreeView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    classPrefix = 'tree',
    className,
    cascade,
    cascadeData = emptyArray,
    cascadePaths = emptyArray,
    childrenKey = 'children',
    disabledItemValues = emptyArray,
    columnWidth = 156,
    columnHeight = 200,
    uncheckableItemValues = emptyArray,
    value,
    valueKey = 'value',
    labelKey = 'label',
    style,
    renderTreeNode,
    renderColumn,
    onCheck,
    onSelect,
    ...rest
  } = props;
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, prefix('items'));
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    id,
    labelId,
    popupType,
    multiple
  } = (0, _Picker.useCombobox)();
  const getCascadePaths = (layer, node) => {
    const paths = [];
    for (let i = 0; i < cascadeData.length && i < layer; i += 1) {
      if (i < layer - 1 && cascadePaths) {
        paths.push(cascadePaths[i]);
      }
    }
    paths.push(node);
    return paths;
  };
  const handleSelect = (0, _hooks.useEventCallback)((layer, node, event) => {
    const cascadePaths = getCascadePaths(layer + 1, node);
    onSelect === null || onSelect === void 0 || onSelect(node, cascadePaths, event);
  });
  const renderCascadeNode = nodeProps => {
    const {
      node,
      index,
      layer,
      focus,
      uncheckable,
      size
    } = nodeProps;
    const children = node[childrenKey];
    const nodeValue = node[valueKey];
    const label = node[labelKey];
    const disabled = disabledItemValues.some(disabledValue => (0, _utils.shallowEqual)(disabledValue, nodeValue));

    // Use `value` in keys when If `value` is string or number
    const onlyKey = typeof value === 'number' || typeof value === 'string' ? value : index;
    const Icon = node.loading ? _Spinner.default : rtl ? _ArrowLeftLine.default : _ArrowRightLine.default;
    let active = value.some(v => v === nodeValue);
    if (cascade) {
      active = active || (0, _utils2.isSomeParentChecked)(node, value, {
        valueKey
      });
    }
    return /*#__PURE__*/_react.default.createElement(_Picker.ListCheckItem, {
      as: "li",
      role: "treeitem",
      "aria-level": layer + 1,
      "aria-setsize": size,
      "aria-posinset": index + 1,
      "aria-label": typeof label === 'string' ? label : undefined,
      key: `${layer}-${onlyKey}`,
      disabled: disabled,
      active: active,
      focus: focus
      // Pass the node as a value to Item, and use it in event callbacks.
      ,
      value: nodeValue,
      className: children ? prefix('has-children') : undefined,
      indeterminate: cascade && !active && (0, _utils2.isSomeChildChecked)(node, value, {
        valueKey,
        childrenKey
      }),
      onSelectItem: (_value, event) => handleSelect(layer, node, event),
      onCheck: (_value, event, checked) => onCheck === null || onCheck === void 0 ? void 0 : onCheck(node, event, checked),
      checkable: !uncheckable,
      labelClickable: false
    }, renderTreeNode ? renderTreeNode(label, node) : label, children ? /*#__PURE__*/_react.default.createElement(Icon, {
      className: prefix('caret'),
      spin: node.loading
    }) : null);
  };
  const columnStyles = {
    height: columnHeight,
    width: columnWidth
  };
  const cascadeNodes = cascadeData.map((children, layer) => {
    let uncheckableCount = 0;
    const onlyKey = `${layer}_${children.length}`;
    const childNodes = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, children.map((item, index) => {
      const uncheckable = uncheckableItemValues.some(uncheckableValue => (0, _utils.shallowEqual)(uncheckableValue, item[valueKey]));
      if (uncheckable) {
        uncheckableCount++;
      }
      const focus = cascadePaths[layer] && (0, _utils.shallowEqual)(cascadePaths[layer][valueKey], item[valueKey]);
      return renderCascadeNode({
        node: item,
        index,
        layer,
        focus,
        uncheckable,
        size: children.length
      });
    }));
    const parentItem = cascadePaths[layer - 1];
    const columnClasses = prefix('column', {
      'column-uncheckable': uncheckableCount === children.length
    });
    return /*#__PURE__*/_react.default.createElement("ul", {
      role: "group",
      key: onlyKey,
      className: columnClasses,
      "data-layer": layer,
      style: columnStyles
    }, renderColumn ? renderColumn(childNodes, {
      items: children,
      parentItem,
      layer
    }) : childNodes);
  });
  const styles = (0, _utils.mergeStyles)(style, {
    width: cascadeData.length * columnWidth
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "tree",
    id: id ? `${id}-${popupType}` : undefined,
    "aria-labelledby": labelId,
    "aria-multiselectable": multiple
  }, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), cascadeNodes);
});
TreeView.displayName = 'TreeView';
var _default = exports.default = TreeView;