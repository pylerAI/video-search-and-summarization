'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _PointerMoveTracker = _interopRequireDefault(require("dom-lib/PointerMoveTracker"));
var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));
var _getWidth = _interopRequireDefault(require("dom-lib/getWidth"));
var _hooks = require("../internals/hooks");
const useDrag = props => {
  const rootRef = (0, _react.useRef)(null);
  const tooltipRef = (0, _react.useRef)(null);
  const {
    tooltip,
    disabled,
    onDragMove,
    onDragEnd,
    onDragStart,
    keepTooltipOpen
  } = props;
  const [active, setActive] = (0, _react.useState)(false);
  const moveTracker = (0, _react.useRef)(null);

  // Release the move event
  const releaseMoves = (0, _react.useCallback)(() => {
    var _moveTracker$current;
    (_moveTracker$current = moveTracker.current) === null || _moveTracker$current === void 0 || _moveTracker$current.releaseMoves();
    moveTracker.current = null;
  }, []);
  const setTooltipPosition = (0, _react.useCallback)(() => {
    const tooltipElement = tooltipRef.current;
    if (tooltip && tooltipElement) {
      const width = (0, _getWidth.default)(tooltipElement);

      // Set the position of the tooltip
      (0, _addStyle.default)(tooltipElement, '--rs-tooltip-offset', `-${width / 2}px`);
    }
  }, [tooltip]);
  const handleDragMove = (0, _hooks.useEventCallback)((_deltaX, _deltaY, event) => {
    var _moveTracker$current2;
    if ((_moveTracker$current2 = moveTracker.current) !== null && _moveTracker$current2 !== void 0 && _moveTracker$current2.isDragging()) {
      var _rootRef$current;
      onDragMove === null || onDragMove === void 0 || onDragMove(event, (_rootRef$current = rootRef.current) === null || _rootRef$current === void 0 ? void 0 : _rootRef$current.dataset);
      setTooltipPosition();
    }
  });
  const handleDragEnd = (0, _hooks.useEventCallback)(event => {
    var _rootRef$current2;
    setActive(false);
    releaseMoves();
    onDragEnd === null || onDragEnd === void 0 || onDragEnd(event, (_rootRef$current2 = rootRef.current) === null || _rootRef$current2 === void 0 ? void 0 : _rootRef$current2.dataset);
  });
  const getMouseMoveTracker = (0, _react.useCallback)(() => {
    return moveTracker.current || new _PointerMoveTracker.default(document.body, {
      onMove: handleDragMove,
      onMoveEnd: handleDragEnd,
      useTouchEvent: true
    });
  }, [handleDragEnd, handleDragMove]);
  const onMoveStart = (0, _hooks.useEventCallback)(event => {
    var _moveTracker$current3, _rootRef$current3;
    if (disabled) {
      return;
    }
    moveTracker.current = getMouseMoveTracker();
    (_moveTracker$current3 = moveTracker.current) === null || _moveTracker$current3 === void 0 || _moveTracker$current3.captureMoves(event);
    (_rootRef$current3 = rootRef.current) === null || _rootRef$current3 === void 0 || _rootRef$current3.focus();
    setActive(true);
    onDragStart === null || onDragStart === void 0 || onDragStart(event);
  });
  const onMouseEnter = (0, _hooks.useEventCallback)(() => {
    setTooltipPosition();
  });
  (0, _react.useEffect)(() => {
    if (keepTooltipOpen) {
      onMouseEnter();
    }
    return () => {
      releaseMoves();
    };
  }, [releaseMoves, keepTooltipOpen]);
  return {
    active,
    rootRef,
    tooltipRef,
    onMoveStart,
    onMouseEnter
  };
};
var _default = exports.default = useDrag;