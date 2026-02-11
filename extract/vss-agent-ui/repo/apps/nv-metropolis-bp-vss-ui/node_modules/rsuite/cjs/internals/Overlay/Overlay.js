'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _Fade = _interopRequireDefault(require("../../Animation/Fade"));
var _Position = _interopRequireWildcard(require("./Position"));
var _OverlayProvider = require("./OverlayProvider");
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Overlay is a powerful component that helps you create floating components.
 * @private
 */
const Overlay = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    overlayContainer
  } = (0, _OverlayProvider.useOverlay)();
  const {
    container = overlayContainer,
    containerPadding,
    placement,
    rootClose,
    children,
    childrenProps,
    transition: Transition = _Fade.default,
    open,
    preventOverflow,
    triggerTarget,
    onClose,
    onExited,
    onExit,
    onExiting,
    onEnter,
    onEntering,
    onEntered,
    followCursor,
    cursorPosition
  } = props;
  const [exited, setExited] = (0, _react.useState)(!open);
  const overlayTarget = (0, _react.useRef)(null);
  if (open) {
    if (exited) setExited(false);
  } else if (!Transition && !exited) {
    setExited(true);
  }
  const mountOverlay = open || Transition && !exited;
  const handleExited = (0, _react.useCallback)(args => {
    setExited(true);
    onExited === null || onExited === void 0 || onExited(args);
  }, [onExited]);
  (0, _hooks.useRootClose)(onClose, {
    triggerTarget,
    overlayTarget,
    disabled: !rootClose || !mountOverlay
  });
  if (!mountOverlay) {
    return null;
  }
  const positionProps = {
    container,
    containerPadding,
    triggerTarget,
    placement,
    preventOverflow,
    followCursor,
    cursorPosition
  };
  const renderChildWithPosition = (transitionProps, transitionRef) => {
    const {
      className
    } = transitionProps || {};
    return /*#__PURE__*/_react.default.createElement(_Position.default, (0, _extends2.default)({}, positionProps, transitionProps, {
      ref: (0, _utils.mergeRefs)(ref, transitionRef)
    }), (positionChildProps, childRef) => {
      // Position will return coordinates and className
      const {
        left,
        top
      } = positionChildProps;

      // Components returned by function children need to control their own positioning information. For example: Picker
      if (typeof children === 'function') {
        return children({
          className,
          //dataAttributes,
          ...positionChildProps,
          ...childrenProps
        }, (0, _utils.mergeRefs)(childRef, overlayTarget));
      }
      const childElement = children;
      const childStyles = (0, _utils.mergeStyles)((0, _Position.getPositionStyle)(left, top), childElement.props.style);
      return /*#__PURE__*/_react.default.cloneElement(childElement, {
        ...childrenProps,
        ...childElement.props,
        className: (0, _classnames.default)(childElement.props.className, className),
        style: childStyles,
        ref: (0, _utils.mergeRefs)(childRef, overlayTarget)
      });
    });
  };
  if (Transition) {
    return /*#__PURE__*/_react.default.createElement(Transition, {
      in: open,
      transitionAppear: true,
      onExit: onExit,
      onExiting: onExiting,
      onExited: handleExited,
      onEnter: onEnter,
      onEntering: onEntering,
      onEntered: onEntered
    }, renderChildWithPosition);
  }
  return renderChildWithPosition();
});
Overlay.displayName = 'Overlay';
var _default = exports.default = Overlay;