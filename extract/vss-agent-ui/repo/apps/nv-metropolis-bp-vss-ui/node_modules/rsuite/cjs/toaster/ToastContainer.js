'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.toastPlacements = exports.defaultToasterContainer = exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));
var _Transition = _interopRequireDefault(require("../Animation/Transition"));
var _ToastContext = _interopRequireDefault(require("./ToastContext"));
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _render = require("./render");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const defaultToasterContainer = () => {
  return _canUseDOM.default ? document.body : null;
};
exports.defaultToasterContainer = defaultToasterContainer;
const toastPlacements = exports.toastPlacements = ['topCenter', 'bottomCenter', 'topStart', 'topEnd', 'bottomStart', 'bottomEnd'];
const useMessages = () => {
  const [messages, setMessages] = (0, _react.useState)([]);
  const getKey = (0, _react.useCallback)(key => {
    if (typeof key === 'undefined' && messages.length) {
      return messages[messages.length - 1].key;
    }
    return key;
  }, [messages]);
  const push = (0, _react.useCallback)((message, options) => {
    const {
      duration,
      mouseReset = true,
      container
    } = options || {};
    const key = (0, _utils.guid)();
    setMessages(prevMessages => [...prevMessages, {
      key,
      visible: true,
      node: message,
      duration,
      mouseReset,
      container
    }]);
    return key;
  }, []);
  const clear = (0, _react.useCallback)(() => {
    // Set all existing messages to be invisible.
    setMessages(messages.map(msg => ({
      ...msg,
      visible: false
    })));

    // Remove all invisible messages after 400ms.
    // The delay removal here is to preserve the animation.
    setTimeout(() => {
      setMessages(() => []);
    }, 400);
  }, [messages]);
  const remove = (0, _react.useCallback)(key => {
    // Set the message of the specified key to invisible.
    setMessages(messages.map(n => {
      if (n.key === getKey(key)) {
        n.visible = false;
      }
      return n;
    }));

    // Remove invisible messages after 400ms.
    setTimeout(() => {
      setMessages(prevMessages => prevMessages.filter(msg => msg.visible));
    }, 400);
  }, [messages, getKey]);
  return {
    messages,
    push,
    clear,
    remove
  };
};
const ToastContainer = /*#__PURE__*/(0, _react.forwardRef)(function ToastContainer(props, ref) {
  const {
    as: Component = 'div',
    className,
    classPrefix = 'toast-container',
    placement = 'topCenter',
    ...rest
  } = props;
  const {
    withPrefix,
    merge,
    rootPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix((0, _kebabCase.default)(placement)));
  const {
    push,
    clear,
    remove,
    messages
  } = useMessages();
  (0, _react.useImperativeHandle)(ref, () => ({
    push,
    clear,
    remove
  }));
  const elements = messages.map(item => {
    const {
      mouseReset,
      duration,
      node
    } = item;
    return /*#__PURE__*/_react.default.createElement(_ToastContext.default.Provider, {
      value: {
        usedToaster: true,
        mouseReset,
        duration
      },
      key: item.key
    }, /*#__PURE__*/_react.default.createElement(_Transition.default, {
      in: item.visible,
      exitedClassName: rootPrefix('toast-fade-exited'),
      exitingClassName: rootPrefix('toast-fade-exiting'),
      enteringClassName: rootPrefix('toast-fade-entering'),
      enteredClassName: rootPrefix('toast-fade-entered'),
      timeout: 300
    }, (transitionProps, ref) => {
      var _node$props, _node$props2;
      const {
        className: transitionClassName,
        ...rest
      } = transitionProps;
      return /*#__PURE__*/_react.default.cloneElement(node, {
        ...rest,
        ref,
        duration,
        onClose: (0, _utils.createChainedFunction)((_node$props = node.props) === null || _node$props === void 0 ? void 0 : _node$props.onClose, () => remove(item.key)),
        className: merge(rootPrefix('toast'), (_node$props2 = node.props) === null || _node$props2 === void 0 ? void 0 : _node$props2.className, transitionClassName)
      });
    }));
  });
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    className: classes
  }), elements);
});
ToastContainer.getInstance = async props => {
  const {
    container,
    ...toastProps
  } = props;

  // Promise to wait for containerRef to be assigned
  let resolveContainerRef = null;
  const containerRefReady = new Promise(resolve => {
    resolveContainerRef = resolve;
  });

  // Create a React ref for the ToastContainer instance
  const toastContainerRef = /*#__PURE__*/_react.default.createRef();

  // Render the ToastContainer component into the specified container
  const containerId = (0, _render.render)(/*#__PURE__*/_react.default.createElement(ToastContainer, (0, _extends2.default)({}, toastProps, {
    ref: ref => {
      var _resolveContainerRef;
      toastContainerRef.current = ref;
      (_resolveContainerRef = resolveContainerRef) === null || _resolveContainerRef === void 0 || _resolveContainerRef();
    }
  })), container);
  await containerRefReady;
  return [toastContainerRef, containerId];
};
ToastContainer.displayName = 'ToastContainer';
var _default = exports.default = ToastContainer;