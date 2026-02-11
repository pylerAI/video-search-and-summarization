'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Ripple = _interopRequireDefault(require("../internals/Ripple"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _ButtonGroup = require("../ButtonGroup");
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The Button component is used to trigger a custom action.
 * @see https://rsuitejs.com/components/button
 */
const Button = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Button', props);
  const buttonGroup = (0, _react.useContext)(_ButtonGroup.ButtonGroupContext);
  const {
    as,
    active: activeProp,
    appearance = 'default',
    block,
    className,
    children,
    classPrefix = 'btn',
    color,
    disabled = buttonGroup === null || buttonGroup === void 0 ? void 0 : buttonGroup.disabled,
    loading,
    role,
    ripple = true,
    size = (buttonGroup === null || buttonGroup === void 0 ? void 0 : buttonGroup.size) || 'md',
    startIcon,
    endIcon,
    type: typeProp,
    toggleable,
    onToggle,
    onClick,
    ...rest
  } = propsWithDefaults;
  const [active, setActive] = (0, _hooks.useControlled)(activeProp, false);
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const buttonContent = (0, _react.useMemo)(() => {
    const spin = /*#__PURE__*/_react.default.createElement("span", {
      className: prefix`spin`
    });
    const rippleElement = ripple && !(0, _utils.isOneOf)(appearance, ['link', 'ghost']) ? /*#__PURE__*/_react.default.createElement(_Ripple.default, null) : null;
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, loading && spin, startIcon ? /*#__PURE__*/_react.default.createElement("span", {
      className: prefix`start-icon`
    }, startIcon) : null, children, endIcon ? /*#__PURE__*/_react.default.createElement("span", {
      className: prefix`end-icon`
    }, endIcon) : null, rippleElement);
  }, [appearance, children, endIcon, loading, prefix, ripple, startIcon]);
  const handleClick = (0, _hooks.useEventCallback)(event => {
    if (toggleable) {
      const nextActive = !active;
      setActive(nextActive);
      onToggle === null || onToggle === void 0 || onToggle(nextActive, event);
    }
    onClick === null || onClick === void 0 || onClick(event);
  });
  const buttonAs = as || (rest.href ? _SafeAnchor.default : 'button');
  const isCustomElement = buttonAs !== 'button' && buttonAs !== _SafeAnchor.default;
  const uncertainProps = {
    [(0, _utils.isDisableableElement)(buttonAs) || buttonAs === _SafeAnchor.default ? 'disabled' : 'aria-disabled']: disabled,
    type: typeProp !== null && typeProp !== void 0 ? typeProp : buttonAs === 'button' ? 'button' : undefined,
    role: role !== null && role !== void 0 ? role : isCustomElement ? 'button' : undefined
  };
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: buttonAs,
    ref: ref,
    className: classes,
    onClick: handleClick,
    "data-appearance": appearance,
    "data-color": color,
    "data-size": size,
    "data-block": block,
    "data-active": active || undefined,
    "data-disabled": disabled,
    "data-loading": loading
  }, uncertainProps, rest), buttonContent);
});
Button.displayName = 'Button';
var _default = exports.default = Button;