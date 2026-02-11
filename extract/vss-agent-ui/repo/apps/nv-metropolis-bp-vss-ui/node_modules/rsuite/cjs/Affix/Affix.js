'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _debounce = _interopRequireDefault(require("lodash/debounce"));
var _getOffset = _interopRequireDefault(require("dom-lib/getOffset"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Get the layout size and offset of the mount element
 */
function useOffset(mountRef, onOffsetChange) {
  const [offset, setOffset] = (0, _react.useState)(null);
  const updateOffset = (0, _react.useCallback)(() => {
    if (!mountRef.current) {
      return;
    }
    const newOffset = (0, _getOffset.default)(mountRef.current);
    if ((newOffset === null || newOffset === void 0 ? void 0 : newOffset.height) !== (offset === null || offset === void 0 ? void 0 : offset.height) || (newOffset === null || newOffset === void 0 ? void 0 : newOffset.width) !== (offset === null || offset === void 0 ? void 0 : offset.width) || (newOffset === null || newOffset === void 0 ? void 0 : newOffset.top) !== (offset === null || offset === void 0 ? void 0 : offset.top) || (newOffset === null || newOffset === void 0 ? void 0 : newOffset.left) !== (offset === null || offset === void 0 ? void 0 : offset.left)) {
      setOffset(newOffset);
      if (offset !== null && newOffset !== null) {
        onOffsetChange === null || onOffsetChange === void 0 || onOffsetChange(newOffset);
      }
    }
  }, [mountRef, offset, onOffsetChange]);

  // Update after the element size changes
  (0, _hooks.useElementResize)(() => mountRef.current, updateOffset);

  // Initialize after the first render
  (0, _hooks.useMount)(updateOffset);

  // Update after window size changes
  (0, _hooks.useEventListener)(window, 'resize', updateOffset, false);

  // Update after window scroll
  (0, _hooks.useEventListener)(window, 'scroll', (0, _debounce.default)(updateOffset, 100), false);
  return offset;
}

/**
 * Get the layout size and offset of the container element
 * @param container
 */
function useContainerOffset(container) {
  const [offset, setOffset] = (0, _react.useState)(null);
  (0, _react.useEffect)(() => {
    const node = typeof container === 'function' ? container() : container;
    setOffset(node ? (0, _getOffset.default)(node) : null);
  }, [container]);
  return offset;
}

/**
 * Check whether the current element should be in a fixed state.
 * @param offset
 * @param containerOffset
 * @param props
 */
function useFixed(offset, containerOffset, props) {
  const {
    top,
    onChange
  } = props;
  const [fixed, setFixed] = (0, _react.useState)(false);
  const handleScroll = (0, _react.useCallback)(() => {
    if (!offset) {
      return;
    }
    const scrollY = window.scrollY || window.pageYOffset;

    // When the scroll distance exceeds the element's top value, it is fixed.
    let nextFixed = scrollY - (Number(offset === null || offset === void 0 ? void 0 : offset.top) - Number(top)) >= 0;

    // If the current element is specified in the container,
    // add to determine whether the current container is in the window range.
    if (containerOffset) {
      nextFixed = nextFixed && scrollY < Number(containerOffset.top) + Number(containerOffset.height);
    }
    if (nextFixed !== fixed) {
      setFixed(nextFixed);
      onChange === null || onChange === void 0 || onChange(nextFixed);
    }
  }, [offset, top, containerOffset, fixed, onChange]);

  // Add scroll event to window
  (0, _hooks.useEventListener)(window, 'scroll', handleScroll, false);
  return fixed;
}

/**
 * Components such as navigation, buttons, etc. can be fixed in the visible range.
 * Commonly used for pages with long content, fixed the specified elements in the visible range of the page to assist in quick operation.
 *
 * @see https://rsuitejs.com/components/affix/
 */
const Affix = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Affix', props);
  const {
    as,
    classPrefix = 'affix',
    className,
    children,
    container,
    top = 0,
    onChange,
    onOffsetChange,
    ...rest
  } = propsWithDefaults;
  const mountRef = (0, _react.useRef)(null);
  const offset = useOffset(mountRef, onOffsetChange);
  const containerOffset = useContainerOffset(container);
  const fixed = useFixed(offset, containerOffset, {
    top,
    onChange
  });
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, {
    [withPrefix()]: fixed
  });
  const {
    width,
    height
  } = offset || {};
  const placeholderStyles = fixed ? {
    width,
    height
  } : undefined;
  const fixedStyles = {
    position: 'fixed',
    top,
    width,
    zIndex: 10
  };
  const affixStyles = fixed ? fixedStyles : undefined;
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: (0, _utils.mergeRefs)(mountRef, ref)
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: classes,
    style: affixStyles
  }, children), fixed && /*#__PURE__*/_react.default.createElement("div", {
    "aria-hidden": true,
    style: placeholderStyles
  }));
});
Affix.displayName = 'Affix';
var _default = exports.default = Affix;