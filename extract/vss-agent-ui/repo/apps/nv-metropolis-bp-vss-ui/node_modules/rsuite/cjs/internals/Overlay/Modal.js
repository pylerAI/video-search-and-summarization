'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _contains = _interopRequireDefault(require("dom-lib/contains"));
var _on = _interopRequireDefault(require("dom-lib/on"));
var _ModalManager = _interopRequireDefault(require("./ModalManager"));
var _Fade = _interopRequireDefault(require("../../Animation/Fade"));
var _Box = _interopRequireDefault(require("../Box"));
var _OverlayProvider = require("./OverlayProvider");
var _constants = require("../constants");
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
let manager;
function getManager() {
  if (!manager) manager = new _ModalManager.default();
  return manager;
}
const useModalManager = () => {
  const modalManager = getManager();
  const modal = (0, _react.useRef)({
    dialog: null,
    backdrop: null
  });
  return {
    get dialog() {
      var _modal$current;
      return (_modal$current = modal.current) === null || _modal$current === void 0 ? void 0 : _modal$current.dialog;
    },
    add: (containerElement, containerClassName) => modalManager.add(modal.current, containerElement, containerClassName),
    remove: () => modalManager.remove(modal.current),
    isTopModal: () => modalManager.isTopModal(modal.current),
    setDialogRef: (0, _react.useCallback)(ref => {
      modal.current.dialog = ref;
    }, []),
    setBackdropRef: (0, _react.useCallback)(ref => {
      modal.current.backdrop = ref;
    }, [])
  };
};
const Modal = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    children,
    transition: Transition,
    dialogTransitionTimeout,
    style,
    className,
    container,
    animationProps,
    containerClassName,
    keyboard = true,
    enforceFocus = true,
    backdrop = true,
    backdropTransitionTimeout,
    backdropStyle,
    backdropClassName,
    open,
    autoFocus = true,
    onEsc,
    onExit,
    onExiting,
    onExited,
    onEnter,
    onEntering,
    onEntered,
    onClose,
    onOpen,
    ...rest
  } = props;
  const [exited, setExited] = (0, _react.useState)(!open);
  const {
    Portal,
    target: containerElement
  } = (0, _hooks.usePortal)({
    container
  });
  const modal = useModalManager();
  if (open) {
    if (exited) setExited(false);
  } else if (!Transition && !exited) {
    setExited(true);
  }
  const mountModal = open || Transition && !exited;
  const lastFocus = (0, _react.useRef)(null);
  const handleDocumentKeyDown = (0, _hooks.useEventCallback)(event => {
    if (keyboard && event.key === _constants.KEY_VALUES.ESC && modal.isTopModal()) {
      onEsc === null || onEsc === void 0 || onEsc(event);
      onClose === null || onClose === void 0 || onClose(event);
    }
  });
  const restoreLastFocus = (0, _react.useCallback)(() => {
    if (lastFocus.current) {
      var _lastFocus$current$fo, _lastFocus$current;
      (_lastFocus$current$fo = (_lastFocus$current = lastFocus.current).focus) === null || _lastFocus$current$fo === void 0 || _lastFocus$current$fo.call(_lastFocus$current);
      lastFocus.current = null;
    }
  }, []);

  /**
   * Determines if the currently focused element is inside the dialog,
   * and if not, returns the focus to the dialog.
   *
   */
  const handleFocusDialog = (0, _hooks.useEventCallback)(onBeforeFocusCallback => {
    const currentActiveElement = document.activeElement;
    const dialog = modal.dialog;
    if (dialog && currentActiveElement && !(0, _contains.default)(dialog, currentActiveElement)) {
      onBeforeFocusCallback === null || onBeforeFocusCallback === void 0 || onBeforeFocusCallback();
      dialog.focus();
    }
  });
  const handleEnforceFocus = (0, _hooks.useEventCallback)(() => {
    if (!enforceFocus || !modal.isTopModal()) {
      return;
    }
    handleFocusDialog();
  });
  const documentKeyDownListener = (0, _react.useRef)(null);
  const documentFocusListener = (0, _react.useRef)(null);
  const handleOpen = (0, _hooks.useEventCallback)(() => {
    if (containerElement) {
      modal.add(containerElement, containerClassName);
    }
    if (!documentKeyDownListener.current) {
      documentKeyDownListener.current = (0, _on.default)(document, 'keydown', handleDocumentKeyDown);
    }
    if (!documentFocusListener.current) {
      documentFocusListener.current = (0, _on.default)(document, 'focus', handleEnforceFocus, true);
    }
    if (autoFocus) {
      handleFocusDialog(() => {
        lastFocus.current = document.activeElement;
      });
    }
    onOpen === null || onOpen === void 0 || onOpen();
  });
  const handleClose = (0, _hooks.useEventCallback)(() => {
    var _documentKeyDownListe, _documentFocusListene;
    modal.remove();
    (_documentKeyDownListe = documentKeyDownListener.current) === null || _documentKeyDownListe === void 0 || _documentKeyDownListe.off();
    documentKeyDownListener.current = null;
    (_documentFocusListene = documentFocusListener.current) === null || _documentFocusListene === void 0 || _documentFocusListene.off();
    documentFocusListener.current = null;
    restoreLastFocus();
  });
  (0, _react.useEffect)(() => {
    if (!open) {
      return;
    }
    handleOpen();
  }, [open, handleOpen]);
  (0, _react.useEffect)(() => {
    if (!exited) {
      return;
    }
    handleClose();
  }, [exited, handleClose]);
  (0, _hooks.useWillUnmount)(() => {
    handleClose();
  });
  const handleExited = (0, _react.useCallback)(() => {
    setExited(true);
  }, []);
  const overlayContainer = (0, _react.useCallback)(() => {
    return modal.dialog;
  }, [modal.dialog]);
  if (!mountModal) {
    return null;
  }
  const renderBackdrop = () => {
    if (Transition) {
      return /*#__PURE__*/_react.default.createElement(_Fade.default, {
        transitionAppear: true,
        in: open,
        timeout: backdropTransitionTimeout
      }, (fadeProps, ref) => {
        const {
          className,
          ...rest
        } = fadeProps;
        return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
          "aria-hidden": true,
          "data-testid": "backdrop"
        }, rest, {
          style: backdropStyle,
          ref: (0, _utils.mergeRefs)(modal.setBackdropRef, ref),
          className: (0, _classnames.default)(backdropClassName, className)
        }));
      });
    }
    return /*#__PURE__*/_react.default.createElement("div", {
      "aria-hidden": true,
      style: backdropStyle,
      className: backdropClassName
    });
  };
  const dialogElement = Transition ? /*#__PURE__*/_react.default.createElement(Transition, (0, _extends2.default)({}, animationProps, {
    transitionAppear: true,
    unmountOnExit: true,
    in: open,
    timeout: dialogTransitionTimeout,
    onExit: onExit,
    onExiting: onExiting,
    onExited: (0, _utils.createChainedFunction)(handleExited, onExited),
    onEnter: onEnter,
    onEntering: onEntering,
    onEntered: onEntered
  }), children) : children;
  return /*#__PURE__*/_react.default.createElement(_OverlayProvider.OverlayProvider, {
    overlayContainer: overlayContainer
  }, /*#__PURE__*/_react.default.createElement(Portal, null, backdrop && renderBackdrop(), /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: (0, _utils.mergeRefs)(modal.setDialogRef, ref),
    style: style,
    className: className,
    tabIndex: -1
  }), dialogElement)));
});
Modal.displayName = 'OverlayModal';
var _default = exports.default = Modal;