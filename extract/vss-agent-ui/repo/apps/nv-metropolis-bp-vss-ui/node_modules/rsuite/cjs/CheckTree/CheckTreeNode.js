'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ListCheckItem = _interopRequireDefault(require("../internals/Picker/ListCheckItem"));
var _TreeNodeToggle = _interopRequireDefault(require("../Tree/TreeNodeToggle"));
var _utils = require("../internals/utils");
var _TreeProvider = require("../internals/Tree/TreeProvider");
var _constants = require("../internals/constants");
var _utils2 = require("../Tree/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const CheckTreeNode = (0, _utils.forwardRef)((props, ref) => {
  const {
    as: Component = 'div',
    style,
    className,
    classPrefix = 'check-tree-node',
    visible = true,
    layer,
    disabled,
    allUncheckable,
    loading,
    expanded,
    hasChildren,
    nodeData,
    focus,
    label,
    uncheckable,
    checkState,
    value,
    treeItemRef,
    onExpand,
    onSelect,
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
    // stop propagation when using custom loading icon
    event === null || event === void 0 || (_event$nativeEvent = event.nativeEvent) === null || _event$nativeEvent === void 0 || (_event$nativeEvent$st = _event$nativeEvent.stopImmediatePropagation) === null || _event$nativeEvent$st === void 0 || _event$nativeEvent$st.call(_event$nativeEvent);
    onExpand === null || onExpand === void 0 || onExpand(nodeData, expanded);
  });
  const handleSelect = (0, _hooks.useEventCallback)((_value, event) => {
    let isChecked = false;
    if (checkState === _constants.CHECK_STATE.UNCHECK || checkState === _constants.CHECK_STATE.INDETERMINATE) {
      isChecked = true;
    }
    if (checkState === _constants.CHECK_STATE.CHECK) {
      isChecked = false;
    }
    const nextNodeData = {
      ...nodeData,
      check: isChecked
    };
    onSelect === null || onSelect === void 0 || onSelect(nextNodeData, event);
  });
  const classes = merge(className, withPrefix({
    disabled,
    'all-uncheckable': !!allUncheckable,
    'text-muted': disabled,
    focus
  }));
  const styles = virtualized ? {
    ...style,
    ...(0, _utils2.indentTreeNode)(rtl, layer - 1)
  } : style;
  const itemRef = (0, _hooks.useFocusVirtualListItem)(focus);
  return visible ? /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    style: styles,
    className: classes,
    ref: ref
  }), /*#__PURE__*/_react.default.createElement(_TreeNodeToggle.default, {
    "aria-label": (expanded ? 'Collapse' : 'Expand') + ` ${labelStr}`,
    data: nodeData,
    expanded: expanded,
    loading: loading,
    hasChildren: hasChildren,
    onClick: handleExpand
  }), /*#__PURE__*/_react.default.createElement(_ListCheckItem.default, {
    as: "div",
    role: "treeitem",
    ref: (0, _utils.mergeRefs)(itemRef, treeItemRef),
    "aria-label": labelStr,
    "aria-expanded": expanded,
    "aria-checked": checkState === _constants.CHECK_STATE.CHECK,
    "aria-selected": focus,
    "aria-disabled": disabled,
    "aria-level": layer,
    "data-layer": layer,
    active: checkState === _constants.CHECK_STATE.CHECK,
    indeterminate: checkState === _constants.CHECK_STATE.INDETERMINATE,
    focus: focus,
    checkable: !uncheckable,
    disabled: disabled,
    value: nodeData.refKey || value,
    className: prefix('content'),
    title: labelStr,
    onSelect: handleSelect
  }, typeof renderTreeNode === 'function' ? renderTreeNode(nodeData) : label)) : null;
});
CheckTreeNode.displayName = 'CheckTreeNode';
var _default = exports.default = CheckTreeNode;