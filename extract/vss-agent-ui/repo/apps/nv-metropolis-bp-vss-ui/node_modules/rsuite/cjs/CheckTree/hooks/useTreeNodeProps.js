'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _utils = require("../utils");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
var _Highlight = _interopRequireDefault(require("../../Highlight"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function useTreeNodeProps(props) {
  const {
    valueKey,
    labelKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const {
    uncheckableItemValues,
    disabledItemValues,
    loadingNodeValues,
    focusItemValue,
    flattenedNodes,
    keyword
  } = props;
  return (0, _react.useCallback)(nodeData => {
    const {
      visible,
      checkState
    } = nodeData;
    const value = nodeData[valueKey];
    const nodeLabel = nodeData[labelKey];
    const allUncheckable = (0, _utils.isAllSiblingNodeUncheckable)(nodeData, flattenedNodes, uncheckableItemValues, valueKey);
    const label = keyword ? /*#__PURE__*/_react.default.createElement(_Highlight.default, {
      as: "span",
      query: keyword
    }, nodeLabel) : nodeLabel;
    const disabled = (0, _utils.getDisabledState)(flattenedNodes, nodeData, {
      disabledItemValues,
      valueKey
    });
    const uncheckable = (0, _utils.isNodeUncheckable)(nodeData, {
      uncheckableItemValues,
      valueKey
    });
    const loading = loadingNodeValues.some(item => item === nodeData[valueKey]);
    const focus = focusItemValue === value;
    return {
      value,
      label,
      visible,
      loading,
      disabled,
      nodeData,
      checkState,
      uncheckable,
      allUncheckable,
      focus
    };
  }, [valueKey, flattenedNodes, uncheckableItemValues, keyword, labelKey, disabledItemValues, loadingNodeValues, focusItemValue]);
}
var _default = exports.default = useTreeNodeProps;