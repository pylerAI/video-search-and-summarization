'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _react = require("react");
var _constants = require("../../internals/constants");
var _hooks = require("../../internals/hooks");
var _Picker = require("../../internals/Picker");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
var _utils = require("../utils");
var _useTreeNodeRefs = _interopRequireDefault(require("./useTreeNodeRefs"));
/**
 * Custom hook that manages the focus behavior of a tree component.
 */
function useFocusTree(props) {
  const {
    filteredData,
    searchKeyword,
    flattenedNodes,
    expandItemValues,
    disabledItemValues,
    onExpand,
    onFocused
  } = props;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    valueKey,
    childrenKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const {
    treeNodesRefs,
    saveTreeNodeRef
  } = (0, _useTreeNodeRefs.default)();
  const treeViewRef = (0, _react.useRef)(null);
  const [focusItemValue, setFocusItemValue] = (0, _react.useState)(null);
  const register = (0, _TreeProvider.useRegisterTreeMethods)();
  const flattenedNodesRef = (0, _react.useRef)(flattenedNodes);
  const getFocusProps = value => {
    const options = {
      disabledItemValues,
      valueKey,
      childrenKey,
      expandItemValues
    };
    const focusableItems = (0, _utils.getFocusableItems)(filteredData, options, (0, _utils.isSearching)(searchKeyword));
    return {
      focusItemValue: value || focusItemValue,
      valueKey,
      focusableItems,
      treeNodesRefs
    };
  };
  const handleFocusItem = (0, _hooks.useEventCallback)(key => {
    const focusProps = getFocusProps();
    let focusedValue = null;
    if (key === _constants.KEY_VALUES.DOWN) {
      focusedValue = (0, _utils.focusNextItem)(focusProps);
    } else if (key === _constants.KEY_VALUES.UP) {
      focusedValue = (0, _utils.focusPreviousItem)(focusProps);
    }
    if (focusedValue) {
      setFocusItemValue(focusedValue);
      onFocused === null || onFocused === void 0 || onFocused(focusedValue);
    }
  });
  const handleLeftArrowEvent = (0, _hooks.useEventCallback)(() => {
    if ((0, _isNil.default)(focusItemValue)) {
      return;
    }
    const focusItem = (0, _utils.getActiveItem)(focusItemValue, flattenedNodes, valueKey);
    const expand = expandItemValues.includes(focusItem === null || focusItem === void 0 ? void 0 : focusItem[valueKey]);
    const onFocusItem = () => {
      var _focusItem$parent, _focusItem$parent2;
      const focusedValue = focusItem === null || focusItem === void 0 || (_focusItem$parent = focusItem.parent) === null || _focusItem$parent === void 0 ? void 0 : _focusItem$parent[valueKey];
      setFocusItemValue(focusedValue);
      onFocused === null || onFocused === void 0 || onFocused(focusedValue);
      (0, _utils.focusTreeNode)(focusItem === null || focusItem === void 0 || (_focusItem$parent2 = focusItem.parent) === null || _focusItem$parent2 === void 0 ? void 0 : _focusItem$parent2.refKey, treeNodesRefs);
    };
    (0, _utils.handleLeftArrow)({
      focusItem,
      expand,
      onExpand,
      childrenKey,
      onFocusItem
    });
  });
  const handleRightArrowEvent = (0, _hooks.useEventCallback)(() => {
    if ((0, _isNil.default)(focusItemValue)) {
      return;
    }
    const focusItem = (0, _utils.getActiveItem)(focusItemValue, flattenedNodes, valueKey);
    const expand = expandItemValues.includes(focusItem === null || focusItem === void 0 ? void 0 : focusItem[valueKey]);
    const onFocusItem = () => handleFocusItem(_constants.KEY_VALUES.DOWN);
    (0, _utils.handleRightArrow)({
      focusItem,
      expand,
      childrenKey,
      onExpand,
      onFocusItem
    });
  });
  const handleHomeKey = (0, _hooks.useEventCallback)(() => {
    const focusProps = getFocusProps();
    const focusedValue = (0, _utils.focusFirstItem)(focusProps);
    if (focusedValue) {
      setFocusItemValue(focusedValue);
      onFocused === null || onFocused === void 0 || onFocused(focusedValue);
    }
  });
  const handleEndKey = (0, _hooks.useEventCallback)(() => {
    const focusProps = getFocusProps();
    const focusedValue = (0, _utils.focusLastItem)(focusProps);
    if (focusedValue) {
      setFocusItemValue(focusedValue);
      onFocused === null || onFocused === void 0 || onFocused(focusedValue);
    }
  });
  const onTreeKeydown = (0, _hooks.useEventCallback)(event => {
    (0, _Picker.onMenuKeyDown)(event, {
      down: () => handleFocusItem(_constants.KEY_VALUES.DOWN),
      up: () => handleFocusItem(_constants.KEY_VALUES.UP),
      left: rtl ? handleRightArrowEvent : handleLeftArrowEvent,
      right: rtl ? handleLeftArrowEvent : handleRightArrowEvent,
      home: handleHomeKey,
      end: handleEndKey
    });
  });
  const focusTreeFirstNode = (0, _hooks.useEventCallback)(() => {
    handleFocusItem(_constants.KEY_VALUES.DOWN);
  });
  const focusTreeActiveNode = (0, _react.useCallback)(() => {
    const refKey = (0, _utils.focusCurrentItem)({
      container: treeViewRef.current
    });
    if (refKey) {
      var _flattenedNodesRef$cu;
      const node = (_flattenedNodesRef$cu = flattenedNodesRef.current) === null || _flattenedNodesRef$cu === void 0 ? void 0 : _flattenedNodesRef$cu[refKey];
      if (node) {
        setFocusItemValue(node[valueKey]);
        onFocused === null || onFocused === void 0 || onFocused(node[valueKey]);
      }
    }
  }, [onFocused, valueKey]);
  (0, _react.useEffect)(() => {
    const unregister = register === null || register === void 0 ? void 0 : register({
      focusTreeFirstNode,
      focusTreeActiveNode
    });
    return () => {
      unregister === null || unregister === void 0 || unregister();
    };
  }, []);
  (0, _react.useEffect)(() => {
    flattenedNodesRef.current = flattenedNodes;
  }, [flattenedNodes]);
  return {
    treeViewRef,
    focusTreeFirstNode,
    focusItemValue,
    treeNodesRefs,
    saveTreeNodeRef,
    setFocusItemValue,
    onTreeKeydown
  };
}
var _default = exports.default = useFocusTree;