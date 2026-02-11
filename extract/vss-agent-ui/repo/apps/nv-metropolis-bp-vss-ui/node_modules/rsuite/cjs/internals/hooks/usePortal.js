'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.usePortal = usePortal;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _reactDom = require("react-dom");
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const MountedPortal = /*#__PURE__*/_react.default.memo(function MountedPortal({
  children,
  container
}) {
  const [mounted, setMounted] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => setMounted(true), []);
  if (container && mounted) {
    return /*#__PURE__*/(0, _reactDom.createPortal)(children, container);
  }
  return null;
});
function usePortal(props = {}) {
  const {
    container,
    waitMount = false
  } = props;
  const containerElement = typeof container === 'function' ? container() : container;
  const rootElement = (0, _react.useMemo)(() => _canUseDOM.default ? containerElement || document.body : null, [containerElement]);
  const Portal = (0, _react.useCallback)(({
    children
  }) => {
    return rootElement != null ? /*#__PURE__*/(0, _reactDom.createPortal)(children, rootElement) : null;
  }, [rootElement]);
  const WaitMountPortal = (0, _react.useCallback)(props => /*#__PURE__*/_react.default.createElement(MountedPortal, (0, _extends2.default)({
    container: rootElement
  }, props)), [rootElement]);
  return {
    target: rootElement,
    Portal: waitMount ? WaitMountPortal : Portal
  };
}
var _default = exports.default = usePortal;