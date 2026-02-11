'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.AvatarGroupContext = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const AvatarGroupContext = exports.AvatarGroupContext = /*#__PURE__*/_react.default.createContext({});

/**
 * The AvatarGroup component is used to represent a collection of avatars.
 * @see https://rsuitejs.com/components/avatar
 */
const AvatarGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('AvatarGroup', props);
  const {
    as,
    classPrefix = 'avatar-group',
    spacing,
    className,
    children,
    stack,
    size,
    style,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    cssVar
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    stack
  }));
  const contextValue = (0, _react.useMemo)(() => ({
    size
  }), [size]);
  const styles = (0, _utils.mergeStyles)(style, cssVar('spacing', spacing, _utils.getCssValue));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "group"
  }, rest, {
    ref: ref,
    className: classes,
    style: styles
  }), /*#__PURE__*/_react.default.createElement(AvatarGroupContext.Provider, {
    value: contextValue
  }, children));
});
AvatarGroup.displayName = 'AvatarGroup';
var _default = exports.default = AvatarGroup;