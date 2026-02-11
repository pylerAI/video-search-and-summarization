'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useDialog = useDialog;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
var _Dialog = _interopRequireDefault(require("./Dialog"));
var _CustomContext = require("../internals/Provider/CustomContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Options for creating a dialog
 */
const WAIT_FOR_CONTAINER_TIMEOUT = 2000;
const useDialogContainer = () => {
  const context = (0, _react.useContext)(_CustomContext.CustomContext);
  (0, _react.useEffect)(() => {
    if (_canUseDOM.default && !(context !== null && context !== void 0 && context.dialogContainer)) {
      console.warn('Warning: useDialog is being used outside of a CustomProvider. ' + 'Please wrap your application with <CustomProvider> to ensure proper functionality.');
    }
  }, [context === null || context === void 0 ? void 0 : context.dialogContainer]);

  // Return the ref from context directly instead of copying to a local ref
  // This ensures we always use the latest mounted DialogContainer instance
  return (context === null || context === void 0 ? void 0 : context.dialogContainer) || {
    current: null
  };
};

/**
 * A hook that provides methods to show dialogs.
 * @see https://rsuitejs.com/components/use-dialog
 */
function useDialog() {
  const dialogContainerRef = useDialogContainer();
  const waitForContainer = (0, _react.useCallback)(async () => {
    if (!_canUseDOM.default) {
      return null;
    }
    if (dialogContainerRef.current) {
      return dialogContainerRef.current;
    }
    const timeoutAt = Date.now() + WAIT_FOR_CONTAINER_TIMEOUT;
    return new Promise(resolve => {
      const checkContainerReady = () => {
        if (dialogContainerRef.current) {
          resolve(dialogContainerRef.current);
          return;
        }
        if (Date.now() > timeoutAt) {
          resolve(null);
          return;
        }
        requestAnimationFrame(checkContainerReady);
      };
      checkContainerReady();
    });
  }, [dialogContainerRef]);
  const createDialog = (0, _react.useCallback)((content, options) => {
    const {
      type,
      title,
      okText,
      cancelText,
      severity,
      defaultValue,
      validate
    } = options;
    return new Promise(resolve => {
      waitForContainer().then(container => {
        if (!_canUseDOM.default || !container) {
          resolve(undefined);
          return;
        }
        let isDialogClosed = false;
        let dialogKey = null;
        const handleClose = result => {
          if (isDialogClosed) {
            return;
          }
          isDialogClosed = true;
          if (dialogKey !== null) {
            container.removeDialog(dialogKey);
          }
          resolve(result);
        };
        let dialogComponent;
        if (type === 'custom' && options.as) {
          const {
            as: Component,
            props
          } = options;
          dialogComponent = /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
            onClose: handleClose
          }, props));
        } else {
          dialogComponent = /*#__PURE__*/_react.default.createElement(_Dialog.default, {
            type: type,
            title: title,
            content: content,
            okText: okText,
            cancelText: cancelText,
            onClose: handleClose,
            defaultValue: defaultValue || '',
            severity: severity,
            validate: validate
          });
        }
        dialogKey = container.renderDialog(dialogComponent);
      });
    });
  }, [waitForContainer]);
  const alert = (0, _react.useCallback)((message, options) => {
    return createDialog(message, {
      ...options,
      type: 'alert'
    });
  }, [createDialog]);
  const confirm = (0, _react.useCallback)((message, options) => {
    return createDialog(message, {
      ...options,
      type: 'confirm'
    });
  }, [createDialog]);
  const prompt = (0, _react.useCallback)((message, options = {}) => {
    return createDialog(message, {
      ...options,
      type: 'prompt'
    });
  }, [createDialog]);
  const open = (0, _react.useCallback)((as, payload, options) => {
    return createDialog(null, {
      ...options,
      as,
      type: 'custom',
      props: {
        payload
      }
    });
  }, [createDialog]);
  return {
    alert,
    confirm,
    prompt,
    open
  };
}
var _default = exports.default = useDialog;