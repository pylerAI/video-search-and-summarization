'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../Box"));
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function isTrivialHref(href) {
  return !href || href.trim() === '#';
}

/**
 * A SafeAnchor is a wrapper around the `<a>` HTML element.
 * @private
 */
const SafeAnchor = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('SafeAnchor', props);
  const {
    as = 'a',
    href,
    disabled,
    onClick,
    ...restProps
  } = propsWithDefaults;
  const handleClick = (0, _react.useCallback)(event => {
    if (disabled || isTrivialHref(href)) {
      event.preventDefault();
    }
    if (disabled) {
      event.stopPropagation();
      return;
    }
    onClick === null || onClick === void 0 || onClick(event);
  }, [disabled, href, onClick]);

  // There are default role and href attributes on the node to ensure Focus management and keyboard interactions.
  const trivialProps = isTrivialHref(href) ? {
    role: 'button',
    href: '#'
  } : null;
  if (disabled) {
    restProps.tabIndex = -1;
    restProps['aria-disabled'] = true;
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    href: href
  }, trivialProps, restProps, {
    onClick: handleClick
  }));
});
SafeAnchor.displayName = 'SafeAnchor';
var _default = exports.default = SafeAnchor;