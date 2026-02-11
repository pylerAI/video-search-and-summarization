'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _useFlattenData = _interopRequireDefault(require("./useFlattenData"));
var _useColumnData = _interopRequireDefault(require("./useColumnData"));
var _hooks = require("../../internals/hooks");
const useSelect = props => {
  const {
    data,
    childrenKey,
    labelKey,
    valueKey,
    onSelect,
    getChildren
  } = props;
  const itemKeys = {
    childrenKey,
    labelKey,
    valueKey
  };
  const {
    flattenData,
    addFlattenData
  } = (0, _useFlattenData.default)(data, itemKeys);

  // The columns displayed in the cascading panel.
  const {
    columnData,
    addColumn,
    setColumnData,
    removeColumnByIndex,
    enforceUpdateColumnData
  } = (0, _useColumnData.default)(flattenData);
  (0, _hooks.useUpdateEffect)(() => {
    enforceUpdateColumnData(data);
  }, [data]);
  const isMounted = (0, _hooks.useIsMounted)();

  // The path after cascading data selection.
  const [selectedPaths, setSelectedPaths] = (0, _react.useState)();
  const handleSelect = (0, _hooks.useEventCallback)((node, cascadePaths, event) => {
    var _node$childrenKey, _node$childrenKey2;
    setSelectedPaths(cascadePaths);
    const columnIndex = cascadePaths.length;

    // Lazy load node's children
    if (typeof getChildren === 'function' && ((_node$childrenKey = node[childrenKey]) === null || _node$childrenKey === void 0 ? void 0 : _node$childrenKey.length) === 0) {
      node.loading = true;
      const children = getChildren(node);
      if (children instanceof Promise) {
        children.then(data => {
          node.loading = false;
          node[childrenKey] = data;
          if (isMounted()) {
            addFlattenData(data, node);
            addColumn(data, columnIndex);
          }
        });
      } else {
        node.loading = false;
        node[childrenKey] = children;
        addFlattenData(children, node);
        addColumn(children, columnIndex);
      }
    } else if ((_node$childrenKey2 = node[childrenKey]) !== null && _node$childrenKey2 !== void 0 && _node$childrenKey2.length) {
      addColumn(node[childrenKey], columnIndex);
    } else {
      // Removes subsequent columns of the current column when the clicked node is a leaf node.
      removeColumnByIndex(columnIndex);
    }
    onSelect === null || onSelect === void 0 || onSelect(node, cascadePaths, event);
  });
  return {
    columnData,
    setColumnData,
    flattenData,
    selectedPaths,
    setSelectedPaths,
    handleSelect
  };
};
var _default = exports.default = useSelect;