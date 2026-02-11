'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const sizerStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  visibility: 'hidden',
  height: 0,
  overflow: 'scroll',
  whiteSpace: 'pre'
};
const copyStyles = (styles, node) => {
  node.style.fontSize = styles.fontSize;
  node.style.fontFamily = styles.fontFamily;
  node.style.fontWeight = styles.fontWeight;
  node.style.fontStyle = styles.fontStyle;
  node.style.letterSpacing = styles.letterSpacing;
  node.style.textTransform = styles.textTransform;
};
/**
 * Use a dynamic input width.
 * The width is automatically adjusted according to the length of the input text characters.
 * @param props
 * @param sizerRef
 * @param placeholderRef
 */
const useInputWidth = (props, sizerRef, placeholderRef) => {
  const {
    minWidth = 1,
    placeholder,
    value,
    onAutosize
  } = props;
  const [inputWidth, setInputWidth] = (0, _react.useState)(minWidth);
  (0, _react.useEffect)(() => {
    if (!sizerRef.current || typeof sizerRef.current.scrollWidth === 'undefined') {
      return;
    }
    let width;
    if (placeholder && !value && placeholderRef.current) {
      width = Math.max(sizerRef.current.scrollWidth, placeholderRef.current.scrollWidth) + 10;
    } else {
      width = sizerRef.current.scrollWidth + 10;
    }
    if (width < minWidth) {
      width = minWidth;
    }
    if (width !== inputWidth) {
      setInputWidth(width);
      onAutosize === null || onAutosize === void 0 || onAutosize(width);
    }
  }, [minWidth, placeholder, inputWidth, value, placeholderRef, sizerRef, onAutosize]);
  return inputWidth;
};
const InputAutosize = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const uniqueId = (0, _react.useMemo)(() => (0, _utils.guid)(), []);
  const {
    defaultValue,
    value,
    style,
    className,
    placeholder,
    inputClassName,
    inputStyle,
    inputId = uniqueId,
    tabIndex
  } = props;
  const rootRef = (0, _react.useRef)(null);
  const inputRef = (0, _react.useRef)(null);
  const sizerRef = (0, _react.useRef)(null);
  const placeholderRef = (0, _react.useRef)(null);
  (0, _react.useImperativeHandle)(ref, () => ({
    root: rootRef.current,
    input: inputRef.current
  }));
  const sizerValue = [defaultValue, value, ''].reduce((previousValue, currentValue) => {
    if (previousValue !== null && previousValue !== undefined) {
      return previousValue;
    }
    return currentValue;
  });
  const inputWidth = useInputWidth(props, sizerRef, placeholderRef);
  const nextInputStyle = {
    boxSizing: 'content-box',
    width: `${inputWidth}px`,
    ...inputStyle
  };
  (0, _react.useEffect)(() => {
    if (!window.getComputedStyle) {
      return;
    }
    const input = inputRef.current;
    const inputStyles = input && window.getComputedStyle(input);
    if (!inputStyles) {
      return;
    }
    if (sizerRef.current) {
      copyStyles(inputStyles, sizerRef.current);
    }
    if (placeholderRef.current) {
      copyStyles(inputStyles, placeholderRef.current);
    }
  }, []);
  const [htmlInputProps] = (0, _utils.partitionHTMLProps)(props);
  htmlInputProps.className = inputClassName;
  htmlInputProps.style = nextInputStyle;
  htmlInputProps.tabIndex = tabIndex;
  if ((0, _utils.isIE)()) {
    // On Internet Explorer, an `x` symbol will appear in the input box.
    // By setting an id, matching the style, hiding the `x` symbol by the style.
    htmlInputProps.id = inputId;
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, {
    ref: rootRef,
    className: className,
    style: style,
    display: "inline-block"
  }, (0, _utils.isIE)() ? /*#__PURE__*/_react.default.createElement("style", {
    dangerouslySetInnerHTML: {
      __html: `input#${inputId}::-ms-clear {display: none;}`
    }
  }) : null, /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({}, htmlInputProps, {
    ref: inputRef,
    type: "text"
  })), /*#__PURE__*/_react.default.createElement("div", {
    ref: sizerRef,
    style: sizerStyle
  }, sizerValue), placeholder ? /*#__PURE__*/_react.default.createElement("div", {
    ref: placeholderRef,
    style: sizerStyle
  }, placeholder) : null);
});
InputAutosize.displayName = 'InputAutosize';
var _default = exports.default = InputAutosize;