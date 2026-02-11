'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _reactUseSet = require("react-use-set");
var _hooks = require("../../internals/hooks");
var _utils = require("../../internals/utils");
/**
 * Hook for handling the state after the option is selected
 */
const useSelect = props => {
  const {
    value,
    onSelect,
    getChildren,
    valueKey,
    onChange,
    childrenKey,
    selectedItem,
    childrenMap
  } = props;

  // The item that focus is on
  const [activeItem, setActiveItem] = (0, _react.useState)(selectedItem);
  const isMounted = (0, _hooks.useIsMounted)();
  const loadingItemsSet = (0, _reactUseSet.useSet)();
  const handleSelect = (0, _hooks.useEventCallback)((node, event) => {
    var _itemData$childrenKey;
    const {
      itemData,
      isLeafNode
    } = node;
    setActiveItem(itemData);

    // Lazy load node's children
    if (typeof getChildren === 'function' && ((_itemData$childrenKey = itemData[childrenKey]) === null || _itemData$childrenKey === void 0 ? void 0 : _itemData$childrenKey.length) === 0 && !childrenMap.has(itemData)) {
      loadingItemsSet.add(itemData);
      const children = getChildren(itemData);
      if (children instanceof Promise) {
        children.then(data => {
          if (isMounted()) {
            loadingItemsSet.delete(itemData);
            childrenMap.set(itemData, data);
          }
        });
      } else {
        loadingItemsSet.delete(itemData);
        childrenMap.set(itemData, children);
      }
    }
    if (isLeafNode) {
      const nextValue = itemData[valueKey];
      if (!(0, _utils.shallowEqual)(value, nextValue)) {
        onChange === null || onChange === void 0 || onChange(nextValue, event);
      }
    }
    onSelect === null || onSelect === void 0 || onSelect(node, event);
  });
  return {
    loadingItemsSet,
    activeItem,
    setActiveItem,
    handleSelect
  };
};
var _default = exports.default = useSelect;