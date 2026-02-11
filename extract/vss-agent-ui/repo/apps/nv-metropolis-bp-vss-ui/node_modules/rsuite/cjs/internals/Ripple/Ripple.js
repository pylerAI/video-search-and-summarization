'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _getOffset = _interopRequireDefault(require("dom-lib/getOffset"));
var _on = _interopRequireDefault(require("dom-lib/on"));
var _Transition = _interopRequireDefault(require("../../Animation/Transition"));
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const getPosition = (target, event) => {
  const offset = (0, _getOffset.default)(target);
  const offsetX = (event.pageX || 0) - offset.left;
  const offsetY = (event.pageY || 0) - offset.top;
  const radiusX = Math.max(offset.width - offsetX, offsetX);
  const radiusY = Math.max(offset.height - offsetY, offsetY);
  const radius = Math.sqrt(Math.pow(radiusX, 2) + Math.pow(radiusY, 2));
  return {
    width: radius * 2,
    height: radius * 2,
    left: offsetX - radius,
    top: offsetY - radius
  };
};

/**
 * The `Ripple` component is used to implement the ripple effect.
 * @private
 */
const Ripple = (0, _utils.forwardRef)((props, ref) => {
  const {
    disableRipple
  } = (0, _hooks.useCustom)();
  const {
    as: Component = 'span',
    className,
    classPrefix = 'ripple',
    onMouseDown,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, prefix('pond'));
  const triggerRef = (0, _react.useRef)(null);
  const [rippling, setRippling] = (0, _react.useState)(false);
  const [position, setPosition] = (0, _react.useState)();
  const handleRippled = () => {
    setRippling(false);
  };
  const handleMouseDown = (0, _react.useCallback)(event => {
    if (triggerRef.current) {
      const position = getPosition(triggerRef.current, event);
      setRippling(true);
      setPosition(position);
      onMouseDown === null || onMouseDown === void 0 || onMouseDown(position, event);
    }
  }, [onMouseDown]);
  (0, _react.useEffect)(() => {
    var _triggerRef$current;
    const parentNode = (_triggerRef$current = triggerRef.current) === null || _triggerRef$current === void 0 ? void 0 : _triggerRef$current.parentNode;
    if (parentNode) {
      const mousedownListener = (0, _on.default)(parentNode, 'mousedown', handleMouseDown);
      return () => {
        mousedownListener === null || mousedownListener === void 0 || mousedownListener.off();
      };
    }
  }, [handleMouseDown]);
  if (disableRipple) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({}, rest, {
    className: classes,
    ref: (0, _utils.mergeRefs)(triggerRef, ref)
  }), /*#__PURE__*/_react.default.createElement(_Transition.default, {
    in: rippling,
    enteringClassName: prefix('rippling'),
    onEntered: handleRippled
  }, (props, ref) => {
    const {
      className,
      ...transitionRest
    } = props;
    return /*#__PURE__*/_react.default.createElement("span", (0, _extends2.default)({}, transitionRest, {
      ref: ref,
      className: merge(withPrefix(), className),
      style: position
    }));
  }));
});
Ripple.displayName = 'Ripple';
var _default = exports.default = Ripple;