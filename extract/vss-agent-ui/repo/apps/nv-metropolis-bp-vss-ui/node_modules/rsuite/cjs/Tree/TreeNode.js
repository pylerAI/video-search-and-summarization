'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _TreeNodeToggle = _interopRequireDefault(require("./TreeNodeToggle"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _TreeProvider = require("../internals/Tree/TreeProvider");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Props for the TreeNode component.
 */

const TreeNode = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    label,
    layer,
    active,
    loading,
    nodeData,
    className,
    classPrefix = 'tree-node',
    disabled,
    visible = true,
    draggable,
    expanded,
    focus,
    style,
    hasChildren,
    dragging,
    dragStatus,
    onSelect,
    onDragStart,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDragEnd,
    onDrop,
    onExpand,
    ...rest
  } = props;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    renderTreeNode,
    virtualized
  } = (0, _TreeProvider.useTreeContextProps)();
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const labelStr = (0, _react.useMemo)(() => (0, _utils.stringifyReactNode)(label), [label]);
  const handleExpand = (0, _hooks.useEventCallback)(event => {
    var _event$nativeEvent, _event$nativeEvent$st;
    // Stop propagation when using custom loading icon
    event === null || event === void 0 || (_event$nativeEvent = event.nativeEvent) === null || _event$nativeEvent === void 0 || (_event$nativeEvent$st = _event$nativeEvent.stopImmediatePropagation) === null || _event$nativeEvent$st === void 0 || _event$nativeEvent$st.call(_event$nativeEvent);
    event.stopPropagation();
    onExpand === null || onExpand === void 0 || onExpand(nodeData, expanded);
  });
  const handleSelect = (0, _hooks.useEventCallback)(event => {
    if (disabled) {
      return;
    }
    onSelect === null || onSelect === void 0 || onSelect(nodeData, event);
  });
  const handleDragStart = (0, _hooks.useEventCallback)(event => {
    onDragStart === null || onDragStart === void 0 || onDragStart(nodeData, event);
  });
  const handleDragEnter = (0, _hooks.useEventCallback)(event => {
    event.preventDefault();
    event.stopPropagation();
    onDragEnter === null || onDragEnter === void 0 || onDragEnter(nodeData, event);
  });
  const handleDragOver = (0, _hooks.useEventCallback)(event => {
    event.preventDefault();
    event.stopPropagation();
    onDragOver === null || onDragOver === void 0 || onDragOver(nodeData, event);
  });
  const handleDragLeave = (0, _hooks.useEventCallback)(event => {
    event.stopPropagation();
    onDragLeave === null || onDragLeave === void 0 || onDragLeave(nodeData, event);
  });
  const handleDragEnd = (0, _hooks.useEventCallback)(event => {
    event.stopPropagation();
    onDragEnd === null || onDragEnd === void 0 || onDragEnd(nodeData, event);
  });
  const handleDrop = (0, _hooks.useEventCallback)(event => {
    event.preventDefault();
    event.stopPropagation();
    onDrop === null || onDrop === void 0 || onDrop(nodeData, event);
  });
  const classes = merge(className, withPrefix({
    disabled,
    active,
    'text-muted': disabled,
    focus
  }));
  const treeItemRef = (0, _hooks.useFocusVirtualListItem)(focus);
  const styles = virtualized ? (0, _utils.mergeStyles)(style, (0, _utils2.indentTreeNode)(rtl, layer - 1)) : style;
  return visible ? /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "treeitem",
    ref: (0, _utils.mergeRefs)(treeItemRef, ref),
    tabIndex: -1,
    "aria-expanded": expanded,
    "aria-label": labelStr,
    "aria-level": layer,
    "aria-disabled": disabled,
    "aria-selected": active,
    "data-layer": layer,
    "data-key": (nodeData === null || nodeData === void 0 ? void 0 : nodeData.refKey) || '',
    title: labelStr,
    className: classes,
    style: styles,
    draggable: draggable,
    onClick: handleSelect,
    onDragStart: handleDragStart,
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDragEnd: handleDragEnd,
    onDrop: handleDrop
  }, rest), /*#__PURE__*/_react.default.createElement(_TreeNodeToggle.default, {
    "aria-label": (expanded ? 'Collapse' : 'Expand') + ` ${labelStr}`,
    data: nodeData,
    loading: loading,
    expanded: expanded,
    hasChildren: hasChildren,
    onClick: handleExpand
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('label', dragStatus, {
      dragging
    })
  }, renderTreeNode ? renderTreeNode(nodeData) : label)) : null;
});
TreeNode.displayName = 'TreeNode';
var _default = exports.default = TreeNode;