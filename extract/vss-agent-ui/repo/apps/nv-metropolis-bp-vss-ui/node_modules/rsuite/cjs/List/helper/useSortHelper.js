'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _on = _interopRequireDefault(require("dom-lib/on"));
var _react = require("react");
var _AutoScroller = _interopRequireDefault(require("./AutoScroller"));
var _utils = require("./utils");
var _hooks = require("../../internals/hooks");
var _useManager = _interopRequireDefault(require("./useManager"));
const helperElementClass = 'rs-list-item-helper';
const holderElementClass = 'rs-list-item-holder';
const useSortHelper = config => {
  const {
    autoScroll,
    pressDelay,
    transitionDuration,
    onSort,
    onSortEnd,
    onSortMove,
    onSortStart
  } = config;
  const [sorting, setSorting] = (0, _react.useState)(false);
  const containerRef = (0, _react.useRef)(null);
  const pressTimer = (0, _react.useRef)(null);
  const {
    listItemRegister,
    getManagedItem,
    getOrderedItems
  } = (0, _useManager.default)();
  const isMounted = (0, _hooks.useIsMounted)();

  /**
   * start dragging
   * */
  const handlePress = (0, _react.useCallback)((event, _targetNode, curManagedItem) => {
    var _curManagedItem$info$, _curManagedItem$info$2, _activeNodeHelper;
    if (!isMounted()) return;
    // data
    const containerElement = containerRef.current;
    const activeNode = curManagedItem.node;
    const activeNodeOldIndex = (_curManagedItem$info$ = curManagedItem.info.index) !== null && _curManagedItem$info$ !== void 0 ? _curManagedItem$info$ : 0;
    let activeNodeNextIndex = (_curManagedItem$info$2 = curManagedItem.info.index) !== null && _curManagedItem$info$2 !== void 0 ? _curManagedItem$info$2 : 0;
    let activeNodeHolderTranslate = {
      x: 0,
      y: 0
    };
    let animatedNodesOffset = []; // all list item offset

    // Get initial position from event
    const isTouchEvent = 'touches' in event;
    const initialPosition = {
      pageX: isTouchEvent ? event.touches[0].pageX : event.pageX,
      pageY: isTouchEvent ? event.touches[0].pageY : event.pageY
    };

    // init scroller
    const scrollContainer = (0, _utils.getScrollingParent)(containerElement) || containerElement;
    const initScroll = {
      x: scrollContainer.scrollLeft,
      y: scrollContainer.scrollTop
    };
    const autoScroller = new _AutoScroller.default(scrollContainer, offset => {
      activeNodeHolderTranslate.x += offset.left;
      activeNodeHolderTranslate.y += offset.top;
    });
    const activeNodeBoundingClientRect = activeNode.getBoundingClientRect();
    const activeNodeOffsetEdge = (0, _utils.getEdgeOffset)(activeNode, containerElement);
    const activeNodeStyle = getComputedStyle(activeNode);
    let activeNodeHelper = activeNode.cloneNode(true);
    (_activeNodeHelper = activeNodeHelper) === null || _activeNodeHelper === void 0 || _activeNodeHelper.classList.add(helperElementClass);
    (0, _utils.setInlineStyles)(activeNodeHelper, {
      position: 'fixed',
      width: `${activeNodeBoundingClientRect.width}px`,
      height: `${activeNodeBoundingClientRect.height}px`,
      insetInlineStart: `${activeNodeBoundingClientRect.left - parseFloat(activeNodeStyle.marginInlineStart)}px`,
      top: `${activeNodeBoundingClientRect.top - parseFloat(activeNodeStyle.marginTop)}px`
    });
    activeNode.classList.add(holderElementClass);
    document.body.appendChild(activeNodeHelper);
    const getContainerScrollDelta = () => ({
      left: scrollContainer.scrollLeft - initScroll.x,
      top: scrollContainer.scrollTop - initScroll.y
    });
    const getHolderTranslate = () => animatedNodesOffset.reduce((acc, item) => ({
      x: acc.x + item.x,
      y: acc.y + item.y
    }), {
      x: 0,
      y: 0
    });

    // Common handler for both mouse and touch move events
    const handleSortMove = moveEvent => {
      // Prevent default to stop page scrolling during touch drag
      if ('touches' in moveEvent) {
        moveEvent.preventDefault();
      }

      // Get current position from event
      const isTouchMoveEvent = 'touches' in moveEvent;
      const currentPosition = {
        pageX: isTouchMoveEvent ? moveEvent.touches[0].pageX : moveEvent.pageX,
        pageY: isTouchMoveEvent ? moveEvent.touches[0].pageY : moveEvent.pageY
      };

      // Update helper position
      const offset = {
        x: currentPosition.pageX,
        y: currentPosition.pageY
      };
      const containerScrollDelta = getContainerScrollDelta();
      const containerBoundingRect = scrollContainer.getBoundingClientRect();
      activeNodeHolderTranslate = {
        x: offset.x - initialPosition.pageX,
        y: offset.y - initialPosition.pageY
      };
      if (activeNodeHelper) {
        (0, _utils.setTranslate3d)(activeNodeHelper, activeNodeHolderTranslate);
      }

      // animate
      activeNodeNextIndex = -1;
      const listItemManagerRefs = getOrderedItems(curManagedItem.info.collection);
      const aTop = activeNodeOffsetEdge.top || 0;
      const cTop = containerScrollDelta.top || 0;
      const sortingOffsetY = aTop + activeNodeHolderTranslate.y + cTop;
      for (let i = 0, len = listItemManagerRefs.length; i < len; i++) {
        var _listItemManagerRefs$;
        const currentNode = listItemManagerRefs[i].node;
        const currentNodeIndex = (_listItemManagerRefs$ = listItemManagerRefs[i].info.index) !== null && _listItemManagerRefs$ !== void 0 ? _listItemManagerRefs$ : 0;
        const offsetY = activeNodeBoundingClientRect.height > currentNode.offsetHeight ? currentNode.offsetHeight / 2 : activeNodeBoundingClientRect.height / 2;
        const translate = {
          x: 0,
          y: 0
        };

        // If we haven't cached the node's offsetTop / offsetLeft value
        const curEdgeOffset = listItemManagerRefs[i].edgeOffset || (0, _utils.getEdgeOffset)(currentNode, containerElement);
        listItemManagerRefs[i].edgeOffset = curEdgeOffset;

        // Get a reference to the next node
        const prvNode = i > 0 && listItemManagerRefs[i - 1];
        const nextNode = i < len - 1 && listItemManagerRefs[i + 1];

        // Also cache the node's edge offset if needed.
        if (prvNode && !prvNode.edgeOffset) {
          prvNode.edgeOffset = (0, _utils.getEdgeOffset)(prvNode.node, containerElement);
        }
        if (nextNode && !nextNode.edgeOffset) {
          nextNode.edgeOffset = (0, _utils.getEdgeOffset)(nextNode.node, containerElement);
        }

        // If the node is the one we're currently animating, skip it
        if (currentNodeIndex === activeNodeOldIndex) {
          continue;
        }
        const curEdgeOffsetTop = curEdgeOffset.top || 0;
        if (prvNode && currentNodeIndex > activeNodeOldIndex && sortingOffsetY + offsetY >= curEdgeOffsetTop) {
          var _prvNode$edgeOffset;
          const yOffset = (((_prvNode$edgeOffset = prvNode.edgeOffset) === null || _prvNode$edgeOffset === void 0 ? void 0 : _prvNode$edgeOffset.top) || 0) - curEdgeOffsetTop;
          translate.y = yOffset;
          animatedNodesOffset[currentNodeIndex] = {
            x: 0,
            y: -yOffset
          };
          activeNodeNextIndex = currentNodeIndex;
        } else if (nextNode && currentNodeIndex < activeNodeOldIndex && sortingOffsetY <= curEdgeOffsetTop + offsetY) {
          var _nextNode$edgeOffset;
          const yOffset = (((_nextNode$edgeOffset = nextNode.edgeOffset) === null || _nextNode$edgeOffset === void 0 ? void 0 : _nextNode$edgeOffset.top) || 0) - curEdgeOffsetTop;
          translate.y = yOffset;
          animatedNodesOffset[currentNodeIndex] = {
            x: 0,
            y: -yOffset
          };
          if (activeNodeNextIndex === -1) {
            activeNodeNextIndex = currentNodeIndex;
          }
        } else {
          animatedNodesOffset[currentNodeIndex] = {
            x: 0,
            y: 0
          };
        }
        (0, _utils.setTransitionDuration)(currentNode, transitionDuration);
        (0, _utils.setTranslate3d)(currentNode, translate);

        // translate holder
        (0, _utils.setTranslate3d)(activeNode, getHolderTranslate());
      }
      if (activeNodeNextIndex === -1) {
        activeNodeNextIndex = activeNodeOldIndex;
      }

      // auto scroll
      if (autoScroll) {
        autoScroller.update({
          width: activeNodeBoundingClientRect.width,
          height: activeNodeBoundingClientRect.height,
          translate: activeNodeHolderTranslate,
          maxTranslate: {
            x: 0,
            y: containerBoundingRect.top + containerBoundingRect.height - activeNodeBoundingClientRect.top - activeNodeBoundingClientRect.height / 2
          },
          minTranslate: {
            x: 0,
            y: containerBoundingRect.top - activeNodeBoundingClientRect.top - activeNodeBoundingClientRect.height / 2
          }
        });
      }
      onSortMove === null || onSortMove === void 0 || onSortMove({
        collection: curManagedItem.info.collection,
        node: activeNode,
        oldIndex: activeNodeOldIndex,
        newIndex: activeNodeNextIndex
      }, moveEvent);
    };

    // Common handler for both mouse and touch end events
    const handleSortEnd = endEvent => {
      var _sortTouchMoveListene, _sortTouchEndListener;
      // Remove the event listeners
      sortMouseMoveListener.off();
      sortMouseEndListener.off();
      (_sortTouchMoveListene = sortTouchMoveListener) === null || _sortTouchMoveListene === void 0 || _sortTouchMoveListene.off();
      (_sortTouchEndListener = sortTouchEndListener) === null || _sortTouchEndListener === void 0 || _sortTouchEndListener.off();

      // Enable page scrolling again
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      const holderTranslate = getHolderTranslate();
      const containerScrollDelta = getContainerScrollDelta();
      if (activeNodeHelper) {
        (0, _utils.setTranslate3d)(activeNodeHelper, {
          x: holderTranslate.x - (containerScrollDelta.left || 0),
          y: holderTranslate.y - (containerScrollDelta.top || 0)
        });
        (0, _utils.setTransitionDuration)(activeNodeHelper, transitionDuration);
      }

      // wait for animation
      setTimeout(() => {
        var _activeNodeHelper2;
        if (!isMounted()) return;
        // Remove the helper from the DOM
        (_activeNodeHelper2 = activeNodeHelper) === null || _activeNodeHelper2 === void 0 || (_activeNodeHelper2 = _activeNodeHelper2.parentNode) === null || _activeNodeHelper2 === void 0 || _activeNodeHelper2.removeChild(activeNodeHelper);
        activeNodeHelper = null;

        // Remove redundant styles
        activeNode.classList.remove(holderElementClass);
        (0, _utils.setTranslate3d)(activeNode, null);
        animatedNodesOffset = [];
        for (const item of getOrderedItems(curManagedItem.info.collection)) {
          // Clear the cached offsetTop / offsetLeft value
          item.edgeOffset = null;

          // Remove the transforms / transitions
          const el = item.node;
          (0, _utils.setTranslate3d)(el, null);
          (0, _utils.setTransitionDuration)(el, null);
        }

        // Stop autoScroll
        autoScroller.clear();

        // Update manager state
        setSorting(false);

        // callbacks
        const callbackPayload = {
          collection: curManagedItem.info.collection,
          node: curManagedItem.node,
          newIndex: activeNodeNextIndex,
          oldIndex: activeNodeOldIndex
        };
        onSortEnd === null || onSortEnd === void 0 || onSortEnd(callbackPayload, endEvent);
        onSort === null || onSort === void 0 || onSort(callbackPayload, endEvent);
      }, transitionDuration);
    };

    // Set up mouse event listeners
    const sortMouseMoveListener = (0, _on.default)(window, 'mousemove', handleSortMove, {
      passive: false
    });
    const sortMouseEndListener = (0, _on.default)(window, 'mouseup', handleSortEnd, {
      passive: false
    });

    // Set up touch event listeners
    let sortTouchMoveListener;
    let sortTouchEndListener;
    if (isTouchEvent) {
      // Disable page scrolling during touch drag
      document.body.style.overflow = 'hidden';
      sortTouchMoveListener = (0, _on.default)(window, 'touchmove', handleSortMove, {
        passive: false
      } // Important: passive: false allows preventDefault() to work
      );
      sortTouchEndListener = (0, _on.default)(window, 'touchend', handleSortEnd, {
        passive: false
      });
    }
    setSorting(true);
    // start callback
    onSortStart === null || onSortStart === void 0 || onSortStart({
      collection: curManagedItem.info.collection,
      node: activeNode,
      oldIndex: activeNodeOldIndex,
      newIndex: activeNodeNextIndex
    }, event);
  }, [autoScroll, getOrderedItems, isMounted, onSort, onSortEnd, onSortMove, onSortStart, transitionDuration]);

  /**
   * Determine whether to start dragging
   * */
  const handleStart = (0, _react.useCallback)(mouseDownEvent => {
    const triggeredNode = mouseDownEvent.target;
    const targetNode = (0, _utils.closestNode)(triggeredNode, el => Boolean(getManagedItem(el)));
    const curManagedItem = getManagedItem(targetNode);
    if (
    // is not secondary button pressed
    mouseDownEvent.button !== 2 &&
    // is list item
    Boolean(curManagedItem) && !curManagedItem.info.disabled &&
    // is not sorting
    !sorting &&
    // is valid node
    targetNode instanceof HTMLElement &&
    // excludes interactive elements
    !targetNode.contains((0, _utils.closestNode)(triggeredNode, _utils.isContainInteractiveElement))) {
      mouseDownEvent.preventDefault();
      pressTimer.current = setTimeout(handlePress, pressDelay, mouseDownEvent, targetNode, curManagedItem);
    }
  }, [getManagedItem, handlePress, pressDelay, sorting]);

  /**
   * Handle touch start for mobile devices
   */
  const handleTouchStart = (0, _react.useCallback)(touchStartEvent => {
    const triggeredNode = touchStartEvent.target;
    const targetNode = (0, _utils.closestNode)(triggeredNode, el => Boolean(getManagedItem(el)));
    const curManagedItem = getManagedItem(targetNode);
    if (
    // is list item
    Boolean(curManagedItem) && !curManagedItem.info.disabled &&
    // is not sorting
    !sorting &&
    // is valid node
    targetNode instanceof HTMLElement &&
    // excludes interactive elements
    !targetNode.contains((0, _utils.closestNode)(triggeredNode, _utils.isContainInteractiveElement))) {
      // Prevent scrolling while sorting
      touchStartEvent.preventDefault();
      pressTimer.current = setTimeout(handlePress, pressDelay, touchStartEvent, targetNode, curManagedItem);
    }
  }, [getManagedItem, handlePress, pressDelay, sorting]);

  /**
   * Clear timer after drag
   * */
  const handleEnd = (0, _react.useCallback)(() => {
    clearTimeout(pressTimer.current);

    // Ensure page scrolling is re-enabled
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }, []);

  /**
   * Clear timer after touch end
   */
  const handleTouchEnd = (0, _react.useCallback)(() => {
    clearTimeout(pressTimer.current);

    // Ensure page scrolling is re-enabled
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
  }, []);
  return {
    handleStart,
    handleEnd,
    handleTouchStart,
    handleTouchEnd,
    containerRef,
    sorting,
    register: listItemRegister
  };
};
var _default = exports.default = useSortHelper;