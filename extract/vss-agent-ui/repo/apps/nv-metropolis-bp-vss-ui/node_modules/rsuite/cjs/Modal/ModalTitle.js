'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _ModalContext = require("./ModalContext");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const ModalTitle = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'h4',
    classPrefix = 'modal-title',
    className,
    role,
    ...rest
  } = props;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const context = (0, _react.useContext)(_ModalContext.ModalContext);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    id: context ? `${context.dialogId}-title` : undefined
  }, rest, {
    role: role,
    ref: ref,
    className: classes
  }));
});
ModalTitle.displayName = 'Modal.Title';
var _default = exports.default = ModalTitle;