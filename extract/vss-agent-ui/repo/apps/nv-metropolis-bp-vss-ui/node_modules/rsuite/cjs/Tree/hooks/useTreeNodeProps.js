'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _constants = require("../../internals/constants");
var _utils = require("../../internals/utils");
var _hooks = require("../../internals/Picker/hooks");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
var _Highlight = _interopRequireDefault(require("../../Highlight"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function useTreeNodeProps(props) {
  const {
    valueKey,
    labelKey,
    childrenKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const {
    id
  } = (0, _hooks.useCombobox)();
  const {
    value,
    disabledItemValues,
    loadingNodeValues,
    focusItemValue,
    keyword,
    dragNode,
    dragOverNodeKey,
    dropNodePosition
  } = props;
  return (0, _react.useCallback)((nodeData, layer, index) => {
    const {
      DRAG_OVER,
      DRAG_OVER_TOP,
      DRAG_OVER_BOTTOM
    } = _constants.TREE_NODE_DROP_POSITION;
    const {
      visible
    } = nodeData;
    const draggingNode = dragNode !== null && dragNode !== void 0 ? dragNode : {};
    const nodeValue = nodeData[valueKey];
    const nodeLabel = nodeData[labelKey];
    const children = nodeData[childrenKey];
    const label = keyword ? /*#__PURE__*/_react.default.createElement(_Highlight.default, {
      as: "span",
      query: keyword
    }, nodeLabel) : nodeLabel;
    const dragging = (0, _utils.shallowEqual)(nodeValue, draggingNode[valueKey]);
    let dragStatus;
    if ((0, _utils.shallowEqual)(nodeValue, dragOverNodeKey)) {
      switch (dropNodePosition) {
        case DRAG_OVER:
          dragStatus = 'drag-over';
          break;
        case DRAG_OVER_TOP:
          dragStatus = 'drag-over-top';
          break;
        case DRAG_OVER_BOTTOM:
          dragStatus = 'drag-over-bottom';
          break;
      }
    }
    const disabled = disabledItemValues.some(disabledItem => (0, _utils.shallowEqual)(disabledItem, nodeValue));
    const loading = loadingNodeValues.some(item => (0, _utils.shallowEqual)(item, nodeValue));
    const active = (0, _utils.shallowEqual)(nodeValue, value);
    const focus = (0, _utils.shallowEqual)(nodeValue, focusItemValue);
    return {
      id: id ? `${id}-opt-${nodeValue}` : undefined,
      value: nodeValue,
      label,
      index,
      layer,
      loading,
      active,
      focus,
      visible,
      children,
      nodeData,
      disabled,
      dragging,
      dragStatus
    };
  }, [childrenKey, disabledItemValues, dragNode, dragOverNodeKey, dropNodePosition, focusItemValue, id, keyword, labelKey, loadingNodeValues, value, valueKey]);
}
var _default = exports.default = useTreeNodeProps;