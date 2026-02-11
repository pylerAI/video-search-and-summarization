'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _getStyle = _interopRequireDefault(require("dom-lib/getStyle"));
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * High-order component that automatically adjusts the width and height of a single child.
 *
 * @private
 */
const AutoSizer = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    children,
    className,
    disableHeight,
    disableWidth,
    defaultHeight,
    defaultWidth,
    style,
    onResize,
    ...rest
  } = props;
  const [height, setHeight] = (0, _react.useState)(defaultHeight || 0);
  const [width, setWidth] = (0, _react.useState)(defaultWidth || 0);
  const rootRef = (0, _react.useRef)(null);
  const getParentNode = (0, _react.useCallback)(() => {
    var _rootRef$current;
    if ((_rootRef$current = rootRef.current) !== null && _rootRef$current !== void 0 && _rootRef$current.parentNode && rootRef.current.parentNode.ownerDocument && rootRef.current.parentNode.ownerDocument.defaultView && rootRef.current.parentNode instanceof rootRef.current.parentNode.ownerDocument.defaultView.HTMLElement) {
      return rootRef.current.parentNode;
    }
    return null;
  }, []);
  const handleResize = (0, _react.useCallback)(() => {
    const parentNode = getParentNode();
    if (parentNode) {
      const offsetHeight = parentNode.offsetHeight || 0;
      const offsetWidth = parentNode.offsetWidth || 0;
      const style = (0, _getStyle.default)(parentNode);
      const paddingLeft = parseInt(style.paddingLeft, 10) || 0;
      const paddingRight = parseInt(style.paddingRight, 10) || 0;
      const paddingTop = parseInt(style.paddingTop, 10) || 0;
      const paddingBottom = parseInt(style.paddingBottom, 10) || 0;
      const newHeight = offsetHeight - paddingTop - paddingBottom;
      const newWidth = offsetWidth - paddingLeft - paddingRight;
      if (!disableHeight && height !== newHeight || !disableWidth && width !== newWidth) {
        setHeight(offsetHeight - paddingTop - paddingBottom);
        setWidth(offsetWidth - paddingLeft - paddingRight);
        onResize === null || onResize === void 0 || onResize({
          height: offsetHeight,
          width: offsetWidth
        });
      }
    }
  }, [disableHeight, disableWidth, getParentNode, height, onResize, width]);
  (0, _hooks.useMount)(handleResize);
  (0, _hooks.useElementResize)(getParentNode(), handleResize);
  const outerStyle = {
    overflow: 'visible'
  };
  const childParams = {
    width: 0,
    height: 0
  };
  if (!disableHeight) {
    outerStyle.height = 0;
    childParams.height = height;
  }
  if (!disableWidth) {
    outerStyle.width = 0;
    childParams.width = width;
  }
  return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
    className: className,
    ref: (0, _utils.mergeRefs)(rootRef, ref),
    style: (0, _utils.mergeStyles)(outerStyle, style)
  }, rest), children(childParams));
});
AutoSizer.displayName = 'AutoSizer';
var _default = exports.default = AutoSizer;