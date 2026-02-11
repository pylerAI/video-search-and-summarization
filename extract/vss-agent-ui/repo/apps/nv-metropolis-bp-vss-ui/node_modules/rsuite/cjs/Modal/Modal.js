'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _on = _interopRequireDefault(require("dom-lib/on"));
var _getAnimationEnd = _interopRequireDefault(require("dom-lib/getAnimationEnd"));
var _Modal = _interopRequireDefault(require("../internals/Overlay/Modal"));
var _Bounce = _interopRequireDefault(require("../Animation/Bounce"));
var _ModalDialog = _interopRequireDefault(require("./ModalDialog"));
var _ModalBody = _interopRequireDefault(require("./ModalBody"));
var _ModalHeader = _interopRequireDefault(require("./ModalHeader"));
var _ModalTitle = _interopRequireDefault(require("./ModalTitle"));
var _ModalFooter = _interopRequireDefault(require("./ModalFooter"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _ModalContext = require("./ModalContext");
var _utils2 = require("./utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const modalSizes = ['xs', 'sm', 'md', 'lg', 'full'];
const Subcomponents = {
  Body: _ModalBody.default,
  Header: _ModalHeader.default,
  Title: _ModalTitle.default,
  Footer: _ModalFooter.default,
  Dialog: _ModalDialog.default
};

/**
 * The `Modal` component is used to show content in a layer above the app.
 * @see https://rsuitejs.com/components/modal
 */
const Modal = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Modal', props);
  const {
    animation = _Bounce.default,
    animationProps,
    animationTimeout = 300,
    'aria-labelledby': ariaLabelledby,
    'aria-describedby': ariaDescribedby,
    backdropClassName,
    backdrop = true,
    bodyFill,
    className,
    classPrefix = 'modal',
    centered,
    dialogClassName,
    dialogStyle,
    dialogAs: Dialog = _ModalDialog.default,
    enforceFocus: enforceFocusProp,
    full,
    overflow = true,
    open,
    onClose,
    onEntered,
    onEntering,
    onExited,
    role = 'dialog',
    size = 'sm',
    id: idProp,
    isDrawer = false,
    closeButton,
    ...rest
  } = propsWithDefaults;
  const inClass = {
    in: open && !animation
  };
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const [shake, setShake] = (0, _react.useState)(false);
  const classes = merge(className, prefix({
    full,
    fill: bodyFill,
    [size]: modalSizes.includes(size)
  }));
  const dialogRef = (0, _react.useRef)(null);
  const transitionEndListener = (0, _react.useRef)(null);

  // The style of the Modal body will be updated with the size of the window or container.
  const [bodyStyles, onChangeBodyStyles, onDestroyEvents] = (0, _utils2.useBodyStyles)(dialogRef, {
    overflow,
    prefix,
    size
  });
  const dialogId = (0, _hooks.useUniqueId)('dialog-', idProp);
  const modalContextValue = (0, _react.useMemo)(() => ({
    dialogId,
    onModalClose: onClose,
    getBodyStyles: () => bodyStyles,
    closeButton,
    isDrawer
  }), [dialogId, onClose, closeButton, isDrawer, bodyStyles]);
  const handleExited = (0, _react.useCallback)(node => {
    var _transitionEndListene;
    onExited === null || onExited === void 0 || onExited(node);
    onDestroyEvents();
    (_transitionEndListene = transitionEndListener.current) === null || _transitionEndListene === void 0 || _transitionEndListene.off();
    transitionEndListener.current = null;
  }, [onDestroyEvents, onExited]);
  const handleEntered = (0, _react.useCallback)(node => {
    onEntered === null || onEntered === void 0 || onEntered(node);
    onChangeBodyStyles();
  }, [onChangeBodyStyles, onEntered]);
  const handleEntering = (0, _react.useCallback)(node => {
    onEntering === null || onEntering === void 0 || onEntering(node);
    onChangeBodyStyles(true);
  }, [onChangeBodyStyles, onEntering]);
  const backdropClick = (0, _react.useRef)(null);
  const handleMouseDown = (0, _react.useCallback)(event => {
    backdropClick.current = event.target === event.currentTarget;
  }, []);
  const handleBackdropClick = (0, _react.useCallback)(event => {
    // Ignore click events from non-backdrop.
    // fix: https://github.com/rsuite/rsuite/issues/3394
    if (!backdropClick.current) {
      return;
    }

    // Ignore click events from dialog.
    if (event.target === dialogRef.current) {
      return;
    }

    // Ignore click events from dialog children.
    if (event.target !== event.currentTarget) {
      return;
    }

    // When the value of `backdrop` is `static`, a jitter animation will be added to the dialog when clicked.
    if (backdrop === 'static') {
      setShake(true);
      if (!transitionEndListener.current && dialogRef.current) {
        //fix: https://github.com/rsuite/rsuite/blob/a93d13c14fb20cc58204babe3331d3c3da3fe1fd/src/Modal/styles/index.less#L59
        transitionEndListener.current = (0, _on.default)(dialogRef.current, (0, _getAnimationEnd.default)(), () => {
          setShake(false);
        });
      }
      return;
    }
    onClose === null || onClose === void 0 || onClose(event);
  }, [backdrop, onClose]);
  (0, _hooks.useWillUnmount)(() => {
    var _transitionEndListene2;
    (_transitionEndListene2 = transitionEndListener.current) === null || _transitionEndListene2 === void 0 || _transitionEndListene2.off();
  });
  let sizeKey = 'width';
  if (isDrawer) {
    const {
      placement
    } = animationProps || {};
    // The width or height of the drawer depends on the placement.
    sizeKey = placement === 'top' || placement === 'bottom' ? 'height' : 'width';
  }
  const enforceFocus = (0, _react.useMemo)(() => {
    if (typeof enforceFocusProp === 'boolean') {
      return enforceFocusProp;
    }

    // When the Drawer is displayed and the backdrop is not displayed, the focus is not restricted.
    if (isDrawer && backdrop === false) {
      return false;
    }
  }, [backdrop, enforceFocusProp, isDrawer]);
  const wrapperClassName = merge(prefix`wrapper`, {
    [prefix`centered`]: centered,
    [prefix`no-backdrop`]: backdrop === false
  });
  return /*#__PURE__*/_react.default.createElement(_ModalContext.ModalContext.Provider, {
    value: modalContextValue
  }, /*#__PURE__*/_react.default.createElement(_Modal.default, (0, _extends2.default)({
    "data-testid": isDrawer ? 'drawer-wrapper' : 'modal-wrapper'
  }, rest, {
    ref: ref,
    backdrop: backdrop,
    enforceFocus: enforceFocus,
    open: open,
    onClose: onClose,
    className: wrapperClassName,
    onEntered: handleEntered,
    onEntering: handleEntering,
    onExited: handleExited,
    backdropClassName: merge(prefix`backdrop`, backdropClassName, inClass),
    containerClassName: prefix({
      open,
      'has-backdrop': backdrop
    }),
    transition: animation ? animation : undefined,
    animationProps: animationProps,
    dialogTransitionTimeout: animationTimeout,
    backdropTransitionTimeout: 150,
    onClick: backdrop ? handleBackdropClick : undefined,
    onMouseDown: handleMouseDown
  }), (transitionProps, transitionRef) => {
    const {
      className: transitionClassName,
      ...transitionRest
    } = transitionProps;
    return /*#__PURE__*/_react.default.createElement(Dialog, (0, _extends2.default)({
      role: role,
      id: dialogId,
      "aria-labelledby": ariaLabelledby !== null && ariaLabelledby !== void 0 ? ariaLabelledby : `${dialogId}-title`,
      "aria-describedby": ariaDescribedby !== null && ariaDescribedby !== void 0 ? ariaDescribedby : `${dialogId}-description`,
      style: {
        [sizeKey]: modalSizes.includes(size) ? undefined : size
      }
    }, transitionRest, (0, _pick.default)(rest, ['size', 'className', 'classPrefix', 'dialogClassName', 'style', 'dialogStyle', 'children']), {
      ref: (0, _utils.mergeRefs)(dialogRef, transitionRef),
      classPrefix: classPrefix,
      className: merge(classes, transitionClassName, prefix({
        shake
      })),
      dialogClassName: dialogClassName,
      dialogStyle: dialogStyle
    }));
  }));
}, Subcomponents);
Modal.displayName = 'Modal';
var _default = exports.default = Modal;