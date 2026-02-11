'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.AutoPlacement = void 0;
exports.calcPosition = calcPosition;
var _maxBy = _interopRequireDefault(require("lodash/maxBy"));
var _minBy = _interopRequireDefault(require("lodash/minBy"));
var _ownerDocument = _interopRequireDefault(require("dom-lib/ownerDocument"));
var _getOffset = _interopRequireDefault(require("dom-lib/getOffset"));
var _scrollTop = _interopRequireDefault(require("dom-lib/scrollTop"));
var _scrollLeft = _interopRequireDefault(require("dom-lib/scrollLeft"));
var _getPosition = _interopRequireDefault(require("dom-lib/getPosition"));
var _getStyle = _interopRequireDefault(require("dom-lib/getStyle"));
var _nodeName = _interopRequireDefault(require("dom-lib/nodeName"));
const AutoPlacement = exports.AutoPlacement = {
  left: 'Start',
  right: 'End',
  top: 'Start',
  bottom: 'End'
};

// Cache for memoization
const dimensionsCache = new Map();

// Cache expiry time (milliseconds)
const CACHE_EXPIRY = 100;

/**
 * Get the external dimensions of the container with memoization for performance
 * @param containerNode Container element
 * @returns Container dimensions information
 */
function getContainerDimensions(containerNode) {
  // Check cache
  const cached = dimensionsCache.get(containerNode);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_EXPIRY) {
    return cached.dimensions;
  }

  // Calculate new dimensions
  let width;
  let height;
  let scrollX;
  let scrollY;
  if (containerNode.tagName === 'BODY') {
    width = window.innerWidth;
    height = window.innerHeight;
    scrollY = (0, _scrollTop.default)((0, _ownerDocument.default)(containerNode).documentElement) || (0, _scrollTop.default)(containerNode);
    scrollX = (0, _scrollLeft.default)((0, _ownerDocument.default)(containerNode).documentElement) || (0, _scrollLeft.default)(containerNode);
  } else {
    ({
      width,
      height
    } = (0, _getOffset.default)(containerNode));
    scrollY = (0, _scrollTop.default)(containerNode);
    scrollX = (0, _scrollLeft.default)(containerNode);
  }
  const dimensions = {
    width,
    height,
    scrollX,
    scrollY
  };

  // Update cache
  dimensionsCache.set(containerNode, {
    dimensions,
    timestamp: now
  });
  return dimensions;
}
function calcPosition(options) {
  const {
    placement,
    preventOverflow,
    padding
  } = options;
  // Ensure placement is a valid type
  const currentPlacement = placement;
  function getTopDelta(top, overlayHeight, container) {
    if (!preventOverflow) {
      return 0;
    }
    const containerDimensions = getContainerDimensions(container);
    const {
      height: containerHeight,
      scrollY
    } = containerDimensions;
    const topEdgeOffset = top - padding - scrollY;
    const bottomEdgeOffset = top + padding + overlayHeight - scrollY;
    if (topEdgeOffset < 0) {
      return -topEdgeOffset;
    } else if (bottomEdgeOffset > containerHeight) {
      return containerHeight - bottomEdgeOffset;
    }
    return 0;
  }
  function getLeftDelta(left, overlayWidth, container) {
    if (!preventOverflow) {
      return 0;
    }
    const containerDimensions = getContainerDimensions(container);
    const {
      scrollX,
      width: containerWidth
    } = containerDimensions;
    const leftEdgeOffset = left - padding - scrollX;
    const rightEdgeOffset = left + padding + overlayWidth - scrollX;
    if (leftEdgeOffset < 0) {
      return -leftEdgeOffset;
    } else if (rightEdgeOffset > containerWidth) {
      return containerWidth - rightEdgeOffset;
    }
    return 0;
  }
  function getPositionTop(container, overlayHeight, top) {
    if (!preventOverflow) {
      return top;
    }
    const {
      scrollY,
      height: containerHeight
    } = getContainerDimensions(container);

    // Check if the bottom of the overlay overflows, set top
    if (overlayHeight + top > containerHeight + scrollY) {
      return containerHeight - overlayHeight + scrollY;
    }

    // The minimum value of top should not be less than the vertical scroll bar y value
    return Math.max(scrollY, top);
  }
  function getPositionLeft(container, overlayWidth, left) {
    if (!preventOverflow) {
      return left;
    }
    const {
      scrollX,
      width: containerWidth
    } = getContainerDimensions(container);
    if (overlayWidth + left > containerWidth + scrollX) {
      return containerWidth - overlayWidth + scrollX;
    }

    // The minimum value of left should not be less than the horizontal scroll bar x value
    return Math.max(scrollX, left);
  }
  return {
    getPosition(target, container) {
      const offset = container.tagName === 'BODY' ? (0, _getOffset.default)(target) : (0, _getPosition.default)(target, container, false);
      return offset;
    },
    getCursorOffsetPosition(target, container, cursorPosition) {
      const {
        left,
        top,
        clientLeft,
        clientTop
      } = cursorPosition;
      const offset = {
        left,
        top,
        width: 10,
        height: 10
      };
      if ((0, _getStyle.default)(target, 'position') === 'fixed') {
        offset.left = clientLeft;
        offset.top = clientTop;
        return offset;
      }
      if (container.tagName === 'BODY') {
        return offset;
      }
      const containerOffset = {
        top: 0,
        left: 0
      };
      if ((0, _nodeName.default)(container) !== 'html') {
        const nextParentOffset = (0, _getOffset.default)(container);
        if (nextParentOffset) {
          containerOffset.top = nextParentOffset.top;
          containerOffset.left = nextParentOffset.left;
        }
      }
      containerOffset.top += parseInt((0, _getStyle.default)(container, 'borderTopWidth'), 10) - (0, _scrollTop.default)(container) || 0;
      containerOffset.left += parseInt((0, _getStyle.default)(container, 'borderLeftWidth'), 10) - (0, _scrollLeft.default)(container) || 0;
      offset.left = left - containerOffset.left;
      offset.top = top - containerOffset.top;
      return offset;
    },
    /**
     * Calculate the optimal auto placement position
     * @param targetOffset Target element offset
     * @param container Container element
     * @param overlay Overlay dimensions
     * @returns Calculated optimal placement position
     */
    calcAutoPlacement(targetOffset, container, overlay) {
      // Get container dimensions and scroll position
      const {
        width,
        height,
        scrollX,
        scrollY
      } = getContainerDimensions(container);

      // Calculate available space in each direction
      const availableSpace = {
        left: targetOffset.left - scrollX - overlay.width,
        top: targetOffset.top - scrollY - overlay.height,
        right: width - targetOffset.left - targetOffset.width + scrollX - overlay.width,
        bottom: height - targetOffset.top - targetOffset.height + scrollY - overlay.height
      };

      // Group available space into horizontal and vertical directions
      const horizontal = [{
        key: 'left',
        value: availableSpace.left
      }, {
        key: 'right',
        value: availableSpace.right
      }];
      const vertical = [{
        key: 'top',
        value: availableSpace.top
      }, {
        key: 'bottom',
        value: availableSpace.bottom
      }];

      // Constants for auto placement
      const AV = 'autoVertical';
      const AH = 'autoHorizontal';

      // Handle specific auto vertical placement
      if (currentPlacement.indexOf(AV) !== -1) {
        const bestDirection = (0, _maxBy.default)(vertical, o => o.value);
        if (!bestDirection) return 'bottom'; // Default value
        return currentPlacement === AV ? bestDirection.key : `${bestDirection.key}${currentPlacement.replace(AV, '')}`;
      }

      // Handle specific auto horizontal placement
      if (currentPlacement.indexOf(AH) !== -1) {
        const bestDirection = (0, _maxBy.default)(horizontal, o => o.value);
        if (!bestDirection) return 'right'; // Default value
        return currentPlacement === AH ? bestDirection.key : `${bestDirection.key}${currentPlacement.replace(AH, '')}`;
      }

      // By default, vertical direction takes precedence
      // Find the direction with the most space to use as main direction
      const bestDirection = (0, _maxBy.default)([...vertical, ...horizontal], o => o.value);
      if (!bestDirection) return 'bottom'; // 默认值

      // Determine alignment based on main direction
      const isHorizontal = bestDirection.key === 'left' || bestDirection.key === 'right';
      const bestAlign = isHorizontal ? (0, _minBy.default)(vertical, o => o.value) // If main direction is horizontal, align vertically
      : (0, _minBy.default)(horizontal, o => o.value); // If main direction is vertical, align horizontally

      if (!bestAlign) return bestDirection.key; // If no alignment, return main direction

      // Return final placement position
      return `${bestDirection.key}${AutoPlacement[bestAlign.key]}`;
    },
    // Calculate the position of the overlay
    calcOverlayPosition(overlayNode, target, container, cursorPosition) {
      // Cache commonly used values to avoid repeated calculations
      const ARROW_OFFSET_FACTOR = 50; // Arrow offset calculation factor
      const isRTL = document.dir === 'rtl';

      // Get target element offset
      const childOffset = cursorPosition ? this.getCursorOffsetPosition(target, container, cursorPosition) : this.getPosition(target, container);
      const {
        height: overlayHeight,
        width: overlayWidth
      } = (0, _getOffset.default)(overlayNode);
      const {
        top,
        left
      } = childOffset;

      // Determine placement position
      let nextPlacement = currentPlacement;
      if (currentPlacement && currentPlacement.indexOf('auto') >= 0) {
        nextPlacement = this.calcAutoPlacement(childOffset, container, {
          height: overlayHeight,
          width: overlayWidth
        });
      }

      // Initialize position and arrow offset values
      let positionLeft;
      let positionTop;
      let arrowOffsetLeft;
      let arrowOffsetTop;

      // Handle basic left/right positions
      if (nextPlacement === 'left' || nextPlacement === 'right') {
        // Vertical centering
        positionTop = childOffset.top + (childOffset.height - overlayHeight) / 2;
        const topDelta = getTopDelta(positionTop, overlayHeight, container);
        positionTop += topDelta;
        arrowOffsetTop = `${ARROW_OFFSET_FACTOR * (1 - 2 * topDelta / overlayHeight)}%`;
        arrowOffsetLeft = undefined;
      }
      // Handle basic top/bottom positions
      else if (nextPlacement === 'top' || nextPlacement === 'bottom') {
        // Horizontal centering
        positionLeft = left + (childOffset.width - overlayWidth) / 2;
        const leftDelta = getLeftDelta(positionLeft, overlayWidth, container);
        positionLeft += leftDelta;
        arrowOffsetLeft = `${ARROW_OFFSET_FACTOR * (1 - 2 * leftDelta / overlayWidth)}%`;
        arrowOffsetTop = undefined;
      }

      // Helper function: Check if placement matches specified prefix
      const matchesPlacement = prefix => {
        return nextPlacement === prefix || nextPlacement === `${prefix}Start` || nextPlacement === `${prefix}End`;
      };

      // Handle top position series
      if (matchesPlacement('top')) {
        positionTop = getPositionTop(container, overlayHeight, childOffset.top - overlayHeight);
      }

      // Handle bottom position series
      if (matchesPlacement('bottom')) {
        positionTop = getPositionTop(container, overlayHeight, childOffset.top + childOffset.height);
      }

      // Handle left position series
      if (matchesPlacement('left')) {
        positionLeft = getPositionLeft(container, overlayWidth, childOffset.left - overlayWidth);
      }

      // Handle right position series
      if (matchesPlacement('right')) {
        positionLeft = getPositionLeft(container, overlayWidth, childOffset.left + childOffset.width);
      }

      // Handle horizontal position adjustment in RTL mode
      if (isRTL && (matchesPlacement('left') || matchesPlacement('right'))) {
        /**
         * When laying out in RTL, if the width of the container
         * is less than the width of the container scrolling,
         * you need to recalculate the left value.
         */
        const {
          width: containerWidth
        } = getContainerDimensions(container);
        if (container.scrollWidth > containerWidth) {
          positionLeft = containerWidth + positionLeft - container.scrollWidth;
        }
      }

      // Handle Start variant positions
      if (nextPlacement === 'topStart' || nextPlacement === 'bottomStart') {
        if (isRTL) {
          const nextLeft = left + (childOffset.width - overlayWidth);
          positionLeft = nextLeft + getLeftDelta(nextLeft, overlayWidth, container);
        } else {
          positionLeft = left + getLeftDelta(left, overlayWidth, container);
        }
      }

      // Handle End variant positions
      if (nextPlacement === 'topEnd' || nextPlacement === 'bottomEnd') {
        if (isRTL) {
          positionLeft = left + getLeftDelta(left, overlayWidth, container);
        } else {
          const nextLeft = left + (childOffset.width - overlayWidth);
          positionLeft = nextLeft + getLeftDelta(nextLeft, overlayWidth, container);
        }
      }

      // Handle leftStart and rightStart
      if (nextPlacement === 'leftStart' || nextPlacement === 'rightStart') {
        positionTop = top + getTopDelta(top, overlayHeight, container);
      }

      // Handle leftEnd and rightEnd
      if (nextPlacement === 'leftEnd' || nextPlacement === 'rightEnd') {
        const nextTop = top + (childOffset.height - overlayHeight);
        positionTop = nextTop + getTopDelta(nextTop, overlayHeight, container);
      }
      return {
        placement: nextPlacement,
        positionLeft,
        positionTop,
        arrowOffsetLeft,
        arrowOffsetTop
      };
    }
  };
}