'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.getPositionStyle = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _getContainer = _interopRequireDefault(require("dom-lib/getContainer"));
var _ownerDocument = _interopRequireDefault(require("dom-lib/ownerDocument"));
var _on = _interopRequireDefault(require("dom-lib/on"));
var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));
var _isElement = _interopRequireDefault(require("../../DOMHelper/isElement"));
var _position = require("./utils/position");
var _resizeObserver = require("@juggle/resize-observer");
var _utils = require("../utils");
var _hooks = require("../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const CSS_POSITION_X = '--rs-position-x';
const CSS_POSITION_Y = '--rs-position-y';
const getPositionStyle = (x, y) => {
  return {
    [CSS_POSITION_X]: x !== undefined ? `${x}px` : undefined,
    [CSS_POSITION_Y]: y !== undefined ? `${y}px` : undefined
  };
};
exports.getPositionStyle = getPositionStyle;
const usePosition = (props, ref) => {
  const {
    placement = 'right',
    preventOverflow = false,
    containerPadding = 0,
    container,
    triggerTarget,
    followCursor,
    cursorPosition
  } = props;
  const containerRef = (0, _react.useRef)(null);
  const lastTargetRef = (0, _react.useRef)(null);
  const overlayResizeObserver = (0, _react.useRef)(null);
  const defaultPosition = {
    placement,
    positionLeft: 0,
    positionTop: 0,
    arrowOffsetLeft: undefined,
    arrowOffsetTop: undefined
  };
  const [position, setPosition] = (0, _react.useState)(defaultPosition);
  const utils = (0, _react.useMemo)(() => (0, _position.calcPosition)({
    placement,
    preventOverflow,
    padding: containerPadding
  }), [placement, preventOverflow, containerPadding]);
  const updatePosition = (0, _react.useCallback)(
  /**
   * @param placementChanged  Whether the placement has changed
   * @param forceUpdateDOM Whether to update the DOM directly
   * @returns void
   */
  (placementChanged = true, forceUpdateDOM) => {
    if (!(triggerTarget !== null && triggerTarget !== void 0 && triggerTarget.current)) {
      return;
    }
    const targetElement = (0, _utils.getDOMNode)(triggerTarget);
    if (!(0, _isElement.default)(targetElement)) {
      throw new Error('`target` should return an HTMLElement');
    }

    //  If the target and placement do not change, the position is not updated.
    if (targetElement === lastTargetRef.current && !placementChanged) {
      return;
    }
    const overlay = (0, _utils.getDOMNode)(ref.current);
    const containerElement = (0, _getContainer.default)(typeof container === 'function' ? container() : container !== null && container !== void 0 ? container : null, (0, _ownerDocument.default)(ref.current).body);
    const posi = utils.calcOverlayPosition(overlay, targetElement, containerElement, followCursor ? cursorPosition : undefined);
    if (forceUpdateDOM && overlay) {
      (0, _addStyle.default)(overlay, getPositionStyle(posi.positionLeft, posi.positionTop));
      if (posi.placement) {
        overlay.dataset.placement = (0, _utils.kebabPlace)(posi.placement);
      }
    } else {
      setPosition(posi);
    }
    containerRef.current = containerElement;
    lastTargetRef.current = targetElement;
  }, [container, ref, triggerTarget, utils, followCursor, cursorPosition]);
  (0, _react.useEffect)(() => {
    updatePosition(false);
    const overlay = (0, _utils.getDOMNode)(ref.current);
    let containerScrollListener;
    if (containerRef.current && preventOverflow) {
      var _containerRef$current;
      // Update the overlay position when the container scroll bar is scrolling
      containerScrollListener = (0, _on.default)(((_containerRef$current = containerRef.current) === null || _containerRef$current === void 0 ? void 0 : _containerRef$current.tagName) === 'BODY' ? window : containerRef.current, 'scroll', () => updatePosition(true, true));
    }

    // Update the position when the window size changes
    const resizeListener = (0, _on.default)(window, 'resize', () => updatePosition(true, true));
    if (overlay) {
      // Update the position when the size of the overlay changes
      overlayResizeObserver.current = new _resizeObserver.ResizeObserver(() => updatePosition(true, true));
      overlayResizeObserver.current.observe(overlay);
    }
    return () => {
      var _containerScrollListe, _overlayResizeObserve;
      lastTargetRef.current = null;
      (_containerScrollListe = containerScrollListener) === null || _containerScrollListe === void 0 || _containerScrollListe.off();
      resizeListener === null || resizeListener === void 0 || resizeListener.off();
      (_overlayResizeObserve = overlayResizeObserver.current) === null || _overlayResizeObserve === void 0 || _overlayResizeObserve.disconnect();
    };
  }, [preventOverflow, ref, updatePosition]);
  (0, _hooks.useUpdateEffect)(() => updatePosition(), [updatePosition, placement]);
  return [position, updatePosition];
};
/**
 * The `Position` component calculates the position of the child element.
 * @private
 */
const Position = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    children,
    followCursor,
    cursorPosition
  } = props;
  const childRef = _react.default.useRef(null);
  const [position, updatePosition] = usePosition(props, childRef);
  const {
    arrowOffsetLeft,
    arrowOffsetTop,
    positionLeft,
    positionTop,
    placement
  } = position;
  (0, _react.useImperativeHandle)(ref, () => ({
    get child() {
      return childRef.current;
    },
    updatePosition
  }));
  (0, _react.useEffect)(() => {
    if (!followCursor || !cursorPosition) return;
    updatePosition();
  }, [followCursor, cursorPosition, updatePosition]);
  if (typeof children === 'function') {
    const childProps = {
      placement,
      arrowOffsetLeft,
      arrowOffsetTop,
      left: positionLeft,
      top: positionTop
    };
    return children(childProps, childRef);
  }
  return children;
});
Position.displayName = 'Position';
var _default = exports.default = Position;