'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.OverlayCloseCause = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _get = _interopRequireDefault(require("lodash/get"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _contains = _interopRequireDefault(require("dom-lib/contains"));
var _Overlay = _interopRequireDefault(require("./Overlay"));
var _OverlayProvider = require("./OverlayProvider");
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function mergeEvents(events = {}, props = {}) {
  const nextEvents = {};
  Object.keys(events).forEach(eventName => {
    if (events[eventName]) {
      nextEvents[eventName] = (0, _utils.createChainedFunction)(events[eventName], props === null || props === void 0 ? void 0 : props[eventName]);
    }
  });
  return nextEvents;
}
/**
 * The reason that triggers closing of an overlay
 * - Clicking outside of the overlay
 * - Direct invocation of triggerRef.current.close()
 */
let OverlayCloseCause = exports.OverlayCloseCause = /*#__PURE__*/function (OverlayCloseCause) {
  OverlayCloseCause[OverlayCloseCause["ClickOutside"] = 0] = "ClickOutside";
  OverlayCloseCause[OverlayCloseCause["ImperativeHandle"] = 1] = "ImperativeHandle";
  return OverlayCloseCause;
}({});
/**
 * Useful for mouseover and mouseout.
 * In order to resolve the node entering the mouseover element, a mouseout event and a mouseover event will be triggered.
 * https://javascript.info/mousemove-mouseover-mouseout-mouseenter-mouseleave
 * @param handler
 * @param event
 */
function onMouseEventHandler(handler, event, relatedNative) {
  const target = event.currentTarget;
  const related = event.relatedTarget || (0, _get.default)(event, ['nativeEvent', relatedNative]);
  if ((!related || related !== target) && !(0, _contains.default)(target, related)) {
    handler(event);
  }
}
const defaultTrigger = ['hover', 'focus'];

/**
 * OverlayTrigger is used to display floating elements on another component.
 * @private
 */
const OverlayTrigger = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    overlayContainer
  } = (0, _OverlayProvider.useOverlay)();
  const {
    children,
    container = overlayContainer,
    controlId,
    defaultOpen,
    trigger = defaultTrigger,
    disabled,
    followCursor,
    readOnly,
    plaintext,
    open: openProp,
    delay,
    delayOpen: delayOpenProp,
    delayClose: delayCloseProp,
    enterable,
    placement = 'bottomStart',
    speaker,
    rootClose = true,
    overlayAs: OverlayComponent,
    onClick,
    onMouseOver,
    onMouseMove,
    onMouseOut,
    onContextMenu,
    onFocus,
    onBlur,
    onOpen,
    onClose,
    onExited,
    ...rest
  } = props;
  const {
    Portal,
    target: containerElement
  } = (0, _hooks.usePortal)({
    container
  });
  const triggerRef = (0, _react.useRef)(null);
  const overlayRef = (0, _react.useRef)(null);
  const [open, setOpen] = (0, _hooks.useControlled)(openProp, defaultOpen);
  const [cursorPosition, setCursorPosition] = (0, _react.useState)(null);

  // Delay the timer to close/open the overlay
  // When the cursor moves from the trigger to the overlay, the overlay will be closed.
  // In order to keep the overlay open, a timer is used to delay the closing.
  const delayOpenTimer = (0, _react.useRef)(null);
  const delayCloseTimer = (0, _react.useRef)(null);
  const delayOpen = (0, _isNil.default)(delayOpenProp) ? delay : delayOpenProp;
  const delayClose = (0, _isNil.default)(delayCloseProp) ? delay : delayCloseProp;

  // Whether the cursor is on the overlay
  const isOnOverlay = (0, _react.useRef)(false);

  // Whether the cursor is on the trigger
  const isOnTrigger = (0, _react.useRef)(false);
  (0, _react.useEffect)(() => {
    return () => {
      if (!(0, _isNil.default)(delayOpenTimer.current)) {
        clearTimeout(delayOpenTimer.current);
      }
      if (!(0, _isNil.default)(delayCloseTimer.current)) {
        clearTimeout(delayCloseTimer.current);
      }
    };
  }, []);

  // Whether the cursor is on the overlay
  const mouseEnter = (0, _react.useRef)(false);
  const handleOpenChange = (0, _react.useCallback)((nextOpen, closeCause) => {
    // if the overlay open state is not changed, do not fire the event
    if (nextOpen === open) return;
    if (nextOpen) {
      onOpen === null || onOpen === void 0 || onOpen();
    } else {
      onClose === null || onClose === void 0 || onClose(closeCause);
    }
    setOpen(nextOpen);
  }, [open, onOpen, onClose, setOpen]);
  const handleOpen = (0, _react.useCallback)(delay => {
    const ms = (0, _isUndefined.default)(delay) ? delayOpen : delay;
    if (ms && typeof ms === 'number') {
      return delayOpenTimer.current = setTimeout(() => {
        delayOpenTimer.current = null;
        if (mouseEnter.current) {
          handleOpenChange(true);
        }
      }, ms);
    }
    handleOpenChange(true);
  }, [delayOpen, handleOpenChange]);
  const handleClose = (0, _react.useCallback)((delay, closeCause) => {
    const ms = (0, _isUndefined.default)(delay) ? delayClose : delay;
    if (ms && typeof ms === 'number') {
      return delayCloseTimer.current = setTimeout(() => {
        delayCloseTimer.current = null;
        handleOpenChange(false, closeCause);
      }, ms);
    }
    handleOpenChange(false, closeCause);
  }, [delayClose, handleOpenChange]);
  const handleExited = (0, _react.useCallback)(() => {
    setCursorPosition(null);
  }, []);
  (0, _react.useImperativeHandle)(ref, () => ({
    get root() {
      return triggerRef.current;
    },
    get overlay() {
      var _overlayRef$current;
      return (_overlayRef$current = overlayRef.current) === null || _overlayRef$current === void 0 ? void 0 : _overlayRef$current.child;
    },
    getState: () => ({
      open
    }),
    open: handleOpen,
    close: delay => handleClose(delay, OverlayCloseCause.ImperativeHandle),
    updatePosition: () => {
      var _overlayRef$current2, _overlayRef$current2$;
      (_overlayRef$current2 = overlayRef.current) === null || _overlayRef$current2 === void 0 || (_overlayRef$current2$ = _overlayRef$current2.updatePosition) === null || _overlayRef$current2$ === void 0 || _overlayRef$current2$.call(_overlayRef$current2);
    }
  }));

  /**
   * Close after the cursor leaves.
   */
  const handleCloseWhenLeave = (0, _react.useCallback)(() => {
    // When the cursor is not on the overlay and not on the trigger, it is closed.
    if (!isOnOverlay.current && !isOnTrigger.current) {
      handleClose(undefined, OverlayCloseCause.ClickOutside);
    }
  }, [handleClose]);
  const handleDelayedOpen = (0, _react.useCallback)(() => {
    mouseEnter.current = true;
    if (!enterable) {
      return handleOpen();
    }
    isOnTrigger.current = true;
    if (!(0, _isNil.default)(delayCloseTimer.current)) {
      clearTimeout(delayCloseTimer.current);
      delayCloseTimer.current = null;
      return handleOpen();
    }
    if (open) {
      return;
    }
    handleOpen();
  }, [enterable, open, handleOpen]);

  /**
   * Toggle open and closed state.
   */
  const handleOpenState = (0, _react.useCallback)(() => {
    if (open) {
      handleCloseWhenLeave();
    } else {
      handleDelayedOpen();
    }
  }, [open, handleCloseWhenLeave, handleDelayedOpen]);
  const handleDelayedClose = (0, _react.useCallback)(() => {
    mouseEnter.current = false;
    if (!enterable) {
      return handleClose();
    }
    isOnTrigger.current = false;
    if (!(0, _isNil.default)(delayOpenTimer.current)) {
      clearTimeout(delayOpenTimer.current);
      delayOpenTimer.current = null;
      return;
    }
    if (!open || !(0, _isNil.default)(delayCloseTimer.current)) {
      return;
    }
    delayCloseTimer.current = setTimeout(() => {
      if (!(0, _isNil.default)(delayCloseTimer.current)) {
        clearTimeout(delayCloseTimer.current);
        delayCloseTimer.current = null;
      }
      handleCloseWhenLeave();
    }, 200);
  }, [enterable, open, handleClose, handleCloseWhenLeave]);
  const handleSpeakerMouseEnter = (0, _react.useCallback)(() => {
    isOnOverlay.current = true;
  }, []);
  const handleSpeakerMouseLeave = (0, _react.useCallback)(() => {
    isOnOverlay.current = false;
    if (!(0, _utils.isOneOf)('click', trigger) && !(0, _utils.isOneOf)('contextMenu', trigger) && !(0, _utils.isOneOf)('active', trigger)) {
      handleCloseWhenLeave();
    }
  }, [handleCloseWhenLeave, trigger]);
  const handledMoveOverlay = (0, _react.useCallback)(event => {
    setCursorPosition(() => ({
      top: event.pageY,
      left: event.pageX,
      clientTop: event.clientX,
      clientLeft: event.clientY
    }));
  }, []);
  const handleMouseOver = (0, _react.useCallback)(event => {
    onMouseEventHandler(handleDelayedOpen, event, 'fromElement');
  }, [handleDelayedOpen]);
  const handleMouseOut = (0, _react.useCallback)(event => {
    onMouseEventHandler(handleDelayedClose, event, 'toElement');
  }, [handleDelayedClose]);
  const preventDefault = (0, _react.useCallback)(event => {
    event.preventDefault();
  }, []);
  const triggerEvents = (0, _react.useMemo)(() => {
    // Pass events by props
    const events = {
      onClick,
      onContextMenu,
      onMouseOver,
      onMouseOut,
      onFocus,
      onBlur,
      onMouseMove
    };

    // When trigger is disabled, no predefined event listeners are added.
    if (disabled || readOnly || plaintext || trigger === 'none') {
      return events;
    }

    // Get the cursor position through onMouseMove.
    // https://rsuitejs.com/components/tooltip/#follow-cursor
    if (followCursor) {
      events.onMouseMove = (0, _utils.createChainedFunction)(handledMoveOverlay, onMouseMove);
    }

    // The `click` event is usually used in `toggle` scenarios.
    // The first click will open and the second click will close.
    if ((0, _utils.isOneOf)('click', trigger)) {
      events.onClick = (0, _utils.createChainedFunction)(handleOpenState, events.onClick);
      return events;
    }

    // The difference between it and the click event is that it does not trigger the close.
    if ((0, _utils.isOneOf)('active', trigger)) {
      events.onClick = (0, _utils.createChainedFunction)(handleDelayedOpen, events.onClick);
      return events;
    }
    if ((0, _utils.isOneOf)('hover', trigger)) {
      events.onMouseOver = (0, _utils.createChainedFunction)(handleMouseOver, events.onMouseOver);
      events.onMouseOut = (0, _utils.createChainedFunction)(handleMouseOut, events.onMouseOut);
    }
    if ((0, _utils.isOneOf)('focus', trigger)) {
      events.onFocus = (0, _utils.createChainedFunction)(handleDelayedOpen, events.onFocus);
      events.onBlur = (0, _utils.createChainedFunction)(handleDelayedClose, events.onBlur);
    }
    if ((0, _utils.isOneOf)('contextMenu', trigger)) {
      events.onContextMenu = (0, _utils.createChainedFunction)(preventDefault, handleOpenState, events.onContextMenu);
    }
    return events;
  }, [disabled, followCursor, handleDelayedClose, handleDelayedOpen, handleMouseOut, handleMouseOver, handleOpenState, handledMoveOverlay, onBlur, onClick, onContextMenu, onFocus, onMouseMove, onMouseOut, onMouseOver, plaintext, preventDefault, readOnly, trigger]);
  const renderOverlay = () => {
    const overlayProps = {
      ...rest,
      rootClose,
      triggerTarget: triggerRef,
      onClose: trigger !== 'none' ? () => handleClose(undefined, OverlayCloseCause.ClickOutside) : undefined,
      onExited: (0, _utils.createChainedFunction)(followCursor ? handleExited : undefined, onExited),
      placement,
      container: containerElement,
      open
    };
    const speakerProps = {
      id: controlId
    };

    // The purpose of adding mouse entry and exit events to the Overlay is to record whether the current cursor is on the Overlay.
    // When `trigger` is equal to `hover`, if the cursor leaves the `triggerTarget` and stays on the Overlay,
    // the Overlay will continue to remain open.
    if (trigger !== 'none' && enterable) {
      speakerProps.onMouseEnter = handleSpeakerMouseEnter;
      speakerProps.onMouseLeave = handleSpeakerMouseLeave;
    }
    return /*#__PURE__*/_react.default.createElement(_Overlay.default, (0, _extends2.default)({}, overlayProps, {
      ref: overlayRef,
      childrenProps: speakerProps,
      followCursor: followCursor,
      cursorPosition: cursorPosition
    }), typeof speaker === 'function' ? (props, ref) => {
      return speaker({
        ...props,
        onClose: handleClose
      }, ref);
    } : speaker);
  };
  const triggerElement = (0, _react.useMemo)(() => {
    if (typeof children === 'function') {
      return children(triggerEvents, triggerRef);
    } else if ((0, _utils.isFragment)(children) || ! /*#__PURE__*/(0, _react.isValidElement)(children)) {
      return /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({
        ref: triggerRef,
        "aria-describedby": controlId
      }, triggerEvents), children);
    }
    const childElement = children;
    return /*#__PURE__*/(0, _react.cloneElement)(childElement, {
      ref: triggerRef,
      'aria-describedby': controlId,
      ...mergeEvents(triggerEvents, childElement.props)
    });
  }, [children, controlId, triggerEvents]);
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, triggerElement, OverlayComponent ? /*#__PURE__*/_react.default.createElement(OverlayComponent, {
    open: open,
    onClose: handleClose,
    placement: "bottom",
    speaker: speaker
  }) : /*#__PURE__*/_react.default.createElement(Portal, null, renderOverlay()));
});
OverlayTrigger.displayName = 'OverlayTrigger';
var _default = exports.default = OverlayTrigger;