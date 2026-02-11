'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _IconButton = _interopRequireDefault(require("../IconButton"));
var _Close = _interopRequireDefault(require("@rsuite/icons/Close"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _ModalContext = require("./ModalContext");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ModalBody = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    classPrefix = 'modal-body',
    className,
    style,
    children,
    ...rest
  } = props;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const context = (0, _react.useContext)(_ModalContext.ModalContext);
  const {
    getBodyStyles,
    closeButton,
    dialogId,
    onModalClose
  } = context || {};
  const bodyStyles = getBodyStyles === null || getBodyStyles === void 0 ? void 0 : getBodyStyles();
  let buttonElement = null;
  if (closeButton) {
    buttonElement = typeof closeButton === 'boolean' ? /*#__PURE__*/_react.default.createElement(_IconButton.default, {
      icon: /*#__PURE__*/_react.default.createElement(_Close.default, null),
      appearance: "subtle",
      size: "sm",
      className: prefix('close'),
      onClick: onModalClose
    }) : closeButton;
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    id: dialogId ? `${dialogId}-description` : undefined,
    ref: ref,
    style: (0, _utils.mergeStyles)(bodyStyles, style),
    className: classes
  }), buttonElement, children);
});
ModalBody.displayName = 'ModalBody';
var _default = exports.default = ModalBody;