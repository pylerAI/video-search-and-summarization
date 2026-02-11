'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _useDelayedClosure = _interopRequireDefault(require("../toaster/hooks/useDelayedClosure"));
var _CloseButton = _interopRequireDefault(require("../internals/CloseButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _statusIcons = require("../internals/constants/statusIcons");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Notification` component is used to display global messages and notifications.
 *
 * @see https://rsuitejs.com/components/notification
 */
const Notification = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Notification', props);
  const {
    as,
    classPrefix = 'notification',
    closable,
    duration = 4500,
    className,
    type,
    header,
    children,
    onClose,
    ...rest
  } = propsWithDefaults;
  const [display, setDisplay] = (0, _react.useState)('show');
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const isMounted = (0, _hooks.useIsMounted)();
  const targetRef = _react.default.useRef(null);

  // Timed close message
  const {
    clear
  } = (0, _useDelayedClosure.default)({
    targetRef,
    onClose,
    duration
  });

  // Click to trigger to close the message
  const handleClose = (0, _hooks.useEventCallback)(event => {
    setDisplay('hiding');
    onClose === null || onClose === void 0 || onClose(event);
    clear();
    setTimeout(() => {
      if (isMounted()) {
        setDisplay('hide');
      }
    }, 1000);
  });
  if (display === 'hide') {
    return null;
  }
  const classes = merge(className, withPrefix(type, {
    closable
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "alert"
  }, rest, {
    ref: (0, _utils.mergeRefs)(targetRef, ref),
    className: classes
  }), type && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`icon`
  }, _statusIcons.MESSAGE_STATUS_ICONS[type]), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`content`
  }, header && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('header')
  }, header), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('description')
  }, typeof children === 'function' ? children() : children)), closable && /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
    onClick: handleClose
  }));
});
Notification.displayName = 'Notification';
var _default = exports.default = Notification;