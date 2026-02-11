'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = useTreeDrag;
var _react = require("react");
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _constants = require("../../internals/constants");
var _hooks = require("../../internals/hooks");
var _utils = require("../../internals/utils");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
/**
 * The gap between tree nodes.
 */
const TREE_NODE_GAP = 4;

/**
 * Calculates the drop position of a tree node based on the clientY coordinate of a drag event
 * and the bounding rectangle of the tree node element.
 *
 * @param event - The drag event.
 * @param treeNodeElement - The element representing the tree node.
 * @returns The drop position of the tree node.
 */
function calDropNodePosition(event, treeNodeElement) {
  const {
    clientY
  } = event;
  const {
    top,
    bottom
  } = treeNodeElement.getBoundingClientRect();
  const gap = TREE_NODE_GAP;

  // bottom of node
  if (clientY >= bottom - gap && clientY <= bottom) {
    return _constants.TREE_NODE_DROP_POSITION.DRAG_OVER_BOTTOM;
  }

  // top of node
  if (clientY <= top + gap && clientY >= top) {
    return _constants.TREE_NODE_DROP_POSITION.DRAG_OVER_TOP;
  }
  if (clientY >= top + gap && clientY <= bottom - gap) {
    return _constants.TREE_NODE_DROP_POSITION.DRAG_OVER;
  }
  return -1;
}

/**
 * Creates a drag preview element for tree nodes.
 */
function createDragPreview(name, className) {
  const dragPreview = document.createElement('div');
  dragPreview.id = 'rs-tree-drag-preview';
  dragPreview.dataset.testid = 'drag-preview';
  dragPreview.innerHTML = name;
  dragPreview.classList.add(className);
  document.body.appendChild(dragPreview);
  return dragPreview;
}

/**
 * Removes the drag preview element from the DOM.
 */
function removeDragPreview() {
  var _dragPreview$parentNo, _dragPreview$parentNo2;
  const dragPreview = document.getElementById('rs-tree-drag-preview');
  dragPreview === null || dragPreview === void 0 || (_dragPreview$parentNo = dragPreview.parentNode) === null || _dragPreview$parentNo === void 0 || (_dragPreview$parentNo2 = _dragPreview$parentNo.removeChild) === null || _dragPreview$parentNo2 === void 0 || _dragPreview$parentNo2.call(_dragPreview$parentNo, dragPreview);
}
/**
 * Custom hook for handling tree node dragging.
 */
function useTreeDrag(props) {
  const {
    childrenKey,
    valueKey,
    labelKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const {
    draggable,
    flattenedNodes,
    treeNodesRefs,
    onDragStart,
    onDragEnter,
    onDragOver,
    onDragLeave,
    onDragEnd,
    onDrop,
    prefix
  } = props;
  // current dragging node
  const dragNode = (0, _react.useRef)(null);
  const [dragOverNodeKey, setDragOverNodeKey] = (0, _react.useState)(null);
  // drag node and it's children nodes key
  const [dragNodeKeys, setDragNodeKeys] = (0, _react.useState)([]);
  const [dropNodePosition, setDropNodePosition] = (0, _react.useState)(null);
  const setDragNode = (0, _react.useCallback)(node => {
    dragNode.current = node;
  }, []);

  /**
   * Retrieves an array of keys for the nodes in a tree starting from the specified drag node.
   */
  const getDragNodeKeys = (0, _react.useCallback)(dragNode => {
    let dragNodeKeys = [dragNode[valueKey]];
    const traverse = data => {
      if ((data === null || data === void 0 ? void 0 : data.length) > 0) {
        data.forEach(node => {
          dragNodeKeys = dragNodeKeys.concat([node[valueKey]]);
          if (node[childrenKey]) {
            traverse(node[childrenKey]);
          }
        });
      }
    };
    traverse(dragNode[childrenKey]);
    return dragNodeKeys;
  }, [childrenKey, valueKey]);

  /**
   * Removes the drag node from the data array.
   *
   */
  const removeDragNode = (0, _react.useCallback)((data, params) => {
    const {
      dragNode
    } = params;
    const traverse = (items, parent) => {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        if ((0, _utils.shallowEqual)(item[valueKey], dragNode[valueKey])) {
          items.splice(index, 1);
          // when children is empty, delete children prop for hidden anchor
          if (items.length === 0 && parent) {
            delete parent.children;
          }
          break;
        }
        if (Array.isArray(item[childrenKey])) {
          traverse(item[childrenKey], item);
        }
      }
    };
    traverse(data);
  }, [childrenKey, valueKey]);

  /**
   * Creates a function that modifies a tree data structure based on drag and drop parameters.
   */
  const createDragTreeDataFunction = (0, _react.useCallback)(params => {
    return function (tree) {
      const data = [...tree];
      const {
        dragNode,
        dropNode,
        dropNodePosition
      } = params;
      const cloneDragNode = {
        ...dragNode
      };
      removeDragNode(data, params);
      const updateTree = items => {
        for (let index = 0; index < items.length; index += 1) {
          const item = items[index];
          if ((0, _utils.shallowEqual)(item[valueKey], dropNode[valueKey])) {
            // drag to node inside
            if (dropNodePosition === _constants.TREE_NODE_DROP_POSITION.DRAG_OVER) {
              item[childrenKey] = (0, _isNil.default)(item[childrenKey]) ? [] : item[childrenKey];
              item[childrenKey].push(cloneDragNode);
              break;
            } else if (dropNodePosition === _constants.TREE_NODE_DROP_POSITION.DRAG_OVER_TOP) {
              // drag to top of node
              items.splice(index, 0, cloneDragNode);
              break;
            } else if (dropNodePosition === _constants.TREE_NODE_DROP_POSITION.DRAG_OVER_BOTTOM) {
              // drag to bottom of node
              items.splice(index + 1, 0, cloneDragNode);
              break;
            }
          }
          if (Array.isArray(item[childrenKey]) && item[childrenKey].length > 0) {
            updateTree(item[childrenKey]);
          }
        }
      };
      updateTree(data);
      return [...data];
    };
  }, [childrenKey, removeDragNode, valueKey]);
  const getDropData = (0, _react.useCallback)(nodeData => {
    const dragParams = {
      dragNode: dragNode.current,
      dropNode: nodeData,
      dropNodePosition
    };
    return {
      ...dragParams,
      createUpdateDataFunction: createDragTreeDataFunction(dragParams)
    };
  }, [createDragTreeDataFunction, dropNodePosition]);
  const handleDragStart = (0, _hooks.useEventCallback)((nodeData, event) => {
    if (draggable) {
      var _event$dataTransfer;
      const dragMoverNode = createDragPreview((0, _utils.stringifyReactNode)(nodeData[labelKey]), prefix('drag-preview'));
      (_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 || _event$dataTransfer.setDragImage(dragMoverNode, 0, 0);
      setDragNodeKeys(getDragNodeKeys(nodeData));
      setDragNode(flattenedNodes[nodeData.refKey]);
      onDragStart === null || onDragStart === void 0 || onDragStart(nodeData, event);
    }
  });
  const handleDragEnter = (0, _hooks.useEventCallback)((nodeData, event) => {
    if (dragNodeKeys.some(d => (0, _utils.shallowEqual)(d, nodeData[valueKey]))) {
      return;
    }
    if (dragNode.current) {
      setDragOverNodeKey(nodeData[valueKey]);
      setDropNodePosition(calDropNodePosition(event, treeNodesRefs[nodeData.refKey]));
    }
    onDragEnter === null || onDragEnter === void 0 || onDragEnter(nodeData, event);
  });
  const handleDragOver = (0, _hooks.useEventCallback)((nodeData, event) => {
    if (dragNodeKeys.some(d => (0, _utils.shallowEqual)(d, nodeData[valueKey]))) {
      event.dataTransfer.dropEffect = 'none';
      return;
    }
    if (dragNode.current && (0, _utils.shallowEqual)(nodeData[valueKey], dragOverNodeKey)) {
      const lastDropNodePosition = calDropNodePosition(event, treeNodesRefs[nodeData.refKey]);
      if (lastDropNodePosition === dropNodePosition) return;
      setDropNodePosition(lastDropNodePosition);
    }
    onDragOver === null || onDragOver === void 0 || onDragOver(nodeData, event);
  });
  const handleDragLeave = (0, _hooks.useEventCallback)((nodeData, event) => {
    onDragLeave === null || onDragLeave === void 0 || onDragLeave(nodeData, event);
  });
  const handleDragEnd = (0, _hooks.useEventCallback)((nodeData, event) => {
    removeDragPreview();
    setDragNode(null);
    setDragNodeKeys([]);
    setDragOverNodeKey(null);
    onDragEnd === null || onDragEnd === void 0 || onDragEnd(nodeData, event);
  });
  const handleDrop = (0, _hooks.useEventCallback)((nodeData, event) => {
    if (dragNodeKeys.some(d => (0, _utils.shallowEqual)(d, nodeData[valueKey]))) {
      console.error('Cannot drag a node to itself and its children');
    } else {
      const dropData = getDropData(nodeData);
      onDrop === null || onDrop === void 0 || onDrop(dropData, event);
    }
    removeDragPreview();
    setDragNode(null);
    setDragNodeKeys([]);
    setDragOverNodeKey(null);
  });
  const dragEvents = {
    onDragStart: handleDragStart,
    onDragEnter: handleDragEnter,
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDragEnd: handleDragEnd,
    onDrop: handleDrop
  };
  return {
    dragNode: dragNode === null || dragNode === void 0 ? void 0 : dragNode.current,
    dragOverNodeKey,
    dropNodePosition,
    dragEvents
  };
}