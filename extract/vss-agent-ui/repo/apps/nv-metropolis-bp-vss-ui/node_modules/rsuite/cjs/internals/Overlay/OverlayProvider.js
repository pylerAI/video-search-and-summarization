'use client';
"use strict";

exports.__esModule = true;
exports.useOverlay = exports.OverlayProvider = void 0;
var _react = _interopRequireWildcard(require("react"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const OverlayContext = /*#__PURE__*/_react.default.createContext({});
const OverlayProvider = props => {
  const {
    overlayContainer,
    children
  } = props;
  return /*#__PURE__*/_react.default.createElement(OverlayContext.Provider, {
    value: {
      overlayContainer
    }
  }, children);
};
exports.OverlayProvider = OverlayProvider;
const useOverlay = () => (0, _react.useContext)(OverlayContext);
exports.useOverlay = useOverlay;
OverlayProvider.displayName = 'OverlayProvider';