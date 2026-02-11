'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _contains = _interopRequireDefault(require("dom-lib/contains"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _utils2 = require("./utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const getKey = (element, target) => {
  return element && target && (0, _contains.default)(element, target) ? 'before' : 'after';
};
const Character = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'li',
    classPrefix = 'rate-character',
    className,
    children,
    vertical,
    status,
    disabled,
    onClick,
    onKeyDown,
    onMouseMove,
    ...rest
  } = props;
  const {
    prefix,
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const beforeRef = (0, _react.useRef)(null);
  const handleMouseMove = (0, _hooks.useEventCallback)(event => {
    onMouseMove === null || onMouseMove === void 0 || onMouseMove(getKey(beforeRef.current, event.target), event);
  });
  const handleClick = (0, _hooks.useEventCallback)(event => {
    onClick === null || onClick === void 0 || onClick(getKey(beforeRef.current, event.target), event);
  });
  const eventHandlers = (0, _react.useMemo)(() => {
    if (disabled) {
      return null;
    }
    return {
      onClick: handleClick,
      onKeyDown,
      onMouseMove: handleMouseMove
    };
  }, [disabled, handleClick, onKeyDown, handleMouseMove]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: merge(className, withPrefix()),
    tabIndex: disabled ? -1 : 0,
    "data-status": (0, _utils2.getStarStatus)(status)
  }, eventHandlers, rest), /*#__PURE__*/_react.default.createElement("div", {
    ref: beforeRef,
    className: prefix('before', {
      vertical
    })
  }, children), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('after')
  }, children));
});
Character.displayName = 'Character';
var _default = exports.default = Character;