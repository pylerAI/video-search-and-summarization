'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _isEqual = _interopRequireDefault(require("lodash/isEqual"));
var _hooks = require("../../internals/hooks");
/**
 * Updates the indicator position based on the active item
 */
const updateIndicatorPosition = (container, activeIndex, indicator) => {
  if (activeIndex === -1) return {};
  const activeItem = container.querySelector(`[data-index="${activeIndex}"]`);
  if (!activeItem) return {};
  const containerStyle = window.getComputedStyle(container);
  const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
  return {
    transform: `translateX(${activeItem.offsetLeft - paddingLeft}px)`,
    width: activeItem.offsetWidth,
    height: indicator === 'underline' ? 2 : activeItem.offsetHeight
  };
};

/**
 * Custom hook to calculate and update the indicator position
 */
const useIndicatorPosition = ({
  containerRef,
  activeIndex,
  indicator,
  data
}) => {
  const [indicatorStyle, setIndicatorStyle] = (0, _react.useState)({});
  const updatePosition = (0, _react.useCallback)(() => {
    if (!(containerRef !== null && containerRef !== void 0 && containerRef.current)) {
      return;
    }
    const newStyle = updateIndicatorPosition(containerRef.current, activeIndex, indicator);
    setIndicatorStyle(prev => (0, _isEqual.default)(prev, newStyle) ? prev : newStyle);
  }, [containerRef, activeIndex, indicator]);

  // Update position when active item or data changes
  (0, _react.useEffect)(() => {
    updatePosition();
  }, [updatePosition, data]);

  // Set up resize observer
  (0, _hooks.useElementResize)(containerRef, updatePosition);
  return {
    style: indicatorStyle
  };
};
var _default = exports.default = useIndicatorPosition;