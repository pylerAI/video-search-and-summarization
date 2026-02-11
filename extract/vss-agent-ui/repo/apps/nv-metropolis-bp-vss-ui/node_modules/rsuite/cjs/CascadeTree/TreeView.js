'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _getPosition = _interopRequireDefault(require("dom-lib/getPosition"));
var _scrollTop = _interopRequireDefault(require("dom-lib/scrollTop"));
var _Spinner = _interopRequireDefault(require("@rsuite/icons/Spinner"));
var _ArrowLeftLine = _interopRequireDefault(require("@rsuite/icons/ArrowLeftLine"));
var _ArrowRightLine = _interopRequireDefault(require("@rsuite/icons/ArrowRightLine"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _Picker = require("../internals/Picker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];
const TreeView = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    activeItemValue,
    classPrefix = 'tree',
    className,
    childrenKey = 'children',
    disabledItemValues = emptyArray,
    columnWidth = 140,
    columnHeight = 200,
    valueKey = 'value',
    data = emptyArray,
    cascadePaths = emptyArray,
    loadingItemsSet,
    labelKey = 'label',
    style,
    renderColumn,
    renderTreeNode,
    onSelect,
    ...rest
  } = props;
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, prefix('items'));
  const rootRef = (0, _react.useRef)(null);
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    id,
    labelId,
    popupType
  } = (0, _Picker.useCombobox)();
  (0, _react.useEffect)(() => {
    var _rootRef$current;
    const columns = ((_rootRef$current = rootRef.current) === null || _rootRef$current === void 0 ? void 0 : _rootRef$current.querySelectorAll('[data-type="column"]')) || [];
    columns.forEach(column => {
      if (!column) {
        return;
      }
      let activeItem = column.querySelector(`.${prefix('item-focus')}`);
      if (!activeItem) {
        activeItem = column.querySelector(`.${prefix('item-active')}`);
      }
      if (activeItem) {
        const position = (0, _getPosition.default)(activeItem, column);
        // Let the active option scroll into view.
        if (position !== null && position !== void 0 && position.top) {
          (0, _scrollTop.default)(column, position === null || position === void 0 ? void 0 : position.top);
        }
      }
    });
  }, [prefix]);
  const getCascadePaths = (layer, node) => {
    const paths = [];
    for (let i = 0; i < data.length && i < layer; i += 1) {
      if (i < layer - 1 && cascadePaths) {
        paths.push(cascadePaths[i]);
      }
    }
    paths.push(node);
    return paths;
  };
  const handleSelect = (0, _hooks.useEventCallback)((layer, itemData, event) => {
    const isLeafNode = (0, _isNil.default)(itemData[childrenKey]);
    const cascadePaths = getCascadePaths(layer + 1, itemData);
    onSelect === null || onSelect === void 0 || onSelect({
      itemData,
      cascadePaths,
      isLeafNode
    }, event);
  });
  const renderCascadeNode = nodeProps => {
    var _loadingItemsSet$has;
    const {
      itemData,
      index,
      layer,
      focus,
      size
    } = nodeProps;
    const children = itemData[childrenKey];
    const value = itemData[valueKey];
    const label = itemData[labelKey];
    const disabled = disabledItemValues.some(disabledValue => (0, _utils.shallowEqual)(disabledValue, value));
    const loading = (_loadingItemsSet$has = loadingItemsSet === null || loadingItemsSet === void 0 ? void 0 : loadingItemsSet.has(itemData)) !== null && _loadingItemsSet$has !== void 0 ? _loadingItemsSet$has : false;

    // Use `value` in keys when If `value` is string or number
    const onlyKey = typeof value === 'number' || typeof value === 'string' ? value : index;
    const Icon = loading ? _Spinner.default : rtl ? _ArrowLeftLine.default : _ArrowRightLine.default;
    return /*#__PURE__*/_react.default.createElement(_Picker.ListItem, {
      as: 'li',
      role: "treeitem",
      "aria-level": layer + 1,
      "aria-setsize": size,
      "aria-posinset": index + 1,
      "aria-label": typeof label === 'string' ? label : undefined,
      classPrefix: "cascade-tree-item",
      key: `${layer}-${onlyKey}`,
      disabled: disabled,
      active: !(0, _isUndefined.default)(activeItemValue) && (0, _utils.shallowEqual)(activeItemValue, value),
      focus: focus,
      value: value,
      className: children ? prefix('has-children') : undefined,
      onSelect: (_value, event) => handleSelect(layer, itemData, event)
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('item-label')
    }, renderTreeNode ? renderTreeNode(label, itemData) : label), children ? /*#__PURE__*/_react.default.createElement(Icon, {
      className: prefix('caret'),
      spin: loading,
      "data-testid": "spinner"
    }) : null);
  };
  const cascadeNodes = data.map((children, layer) => {
    const onlyKey = `${layer}_${children.length}`;
    const parentItem = cascadePaths[layer - 1];
    const childNodes = /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, children.map((itemData, index) => {
      const focus = cascadePaths[layer] && (0, _utils.shallowEqual)(cascadePaths[layer][valueKey], itemData[valueKey]);
      return renderCascadeNode({
        itemData,
        index,
        layer,
        focus,
        size: children.length
      });
    }));
    return /*#__PURE__*/_react.default.createElement("ul", {
      role: "group",
      "data-layer": layer,
      "data-type": 'column',
      key: onlyKey,
      className: prefix('column'),
      style: {
        height: columnHeight,
        width: columnWidth
      }
    }, renderColumn ? renderColumn(childNodes, {
      items: children,
      parentItem,
      layer
    }) : childNodes);
  });
  const styles = (0, _utils.mergeStyles)(style, {
    width: data.length * columnWidth
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    role: "tree",
    id: id ? `${id}-${popupType}` : undefined,
    "aria-labelledby": labelId
  }, rest, {
    ref: (0, _utils.mergeRefs)(rootRef, ref),
    className: classes,
    style: styles
  }), cascadeNodes);
});
TreeView.displayName = 'TreeView';
var _default = exports.default = TreeView;