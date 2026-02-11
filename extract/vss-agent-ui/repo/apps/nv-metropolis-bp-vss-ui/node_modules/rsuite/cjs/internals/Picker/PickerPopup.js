'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));
var _getWidth = _interopRequireDefault(require("dom-lib/getWidth"));
var _hooks = require("../hooks");
var _utils = require("../utils");
var _ = require("./");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Define an array of placements that require resizing
const resizePlacement = ['topStart', 'topEnd', 'leftEnd', 'rightEnd', 'auto', 'autoVerticalStart', 'autoVerticalEnd', 'autoHorizontalEnd'];
const PickerPopup = (0, _utils.forwardRef)((props, ref) => {
  const {
    placement,
    breakpoint
  } = (0, _.useCombobox)();
  const {
    as: Component = 'div',
    autoWidth,
    className,
    classPrefix = 'picker-popup',
    target,
    ...rest
  } = props;
  const overlayRef = (0, _react.useRef)(null);
  const handleResize = (0, _hooks.useEventCallback)(() => {
    const instance = target === null || target === void 0 ? void 0 : target.current;
    if (instance && placement && resizePlacement.includes(placement)) {
      var _instance$updatePosit;
      (_instance$updatePosit = instance.updatePosition) === null || _instance$updatePosit === void 0 || _instance$updatePosit.call(instance);
    }
  });

  // Use useElementResize hook to listen for element size changes
  (0, _hooks.useElementResize)((0, _react.useCallback)(() => overlayRef.current, []), handleResize);
  (0, _react.useEffect)(() => {
    const toggle = target === null || target === void 0 ? void 0 : target.current;
    if (autoWidth && toggle !== null && toggle !== void 0 && toggle.root) {
      // Get the width of the button and set it to the menu to make them consistent
      const width = (0, _getWidth.default)((0, _utils.getDOMNode)(toggle.root));
      if (overlayRef.current) {
        (0, _addStyle.default)(overlayRef.current, '--rs-picker-min-width', `${width}px`);
      }
    }
  }, [autoWidth, target, overlayRef]);
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
    "data-testid": "picker-popup",
    ref: (0, _utils.mergeRefs)(overlayRef, ref),
    className: classes,
    "data-breakpoint": breakpoint
  }, rest));
});
PickerPopup.displayName = 'PickerPopup';
var _default = exports.default = PickerPopup;