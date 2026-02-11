'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Placeholder.Paragraph` component is used to display the loading state of the block.
 * @see https://rsuitejs.com/components/placeholder
 */
const PlaceholderParagraph = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('PlaceholderParagraph', props);
  const {
    as,
    className,
    classPrefix = 'placeholder',
    rows = 3,
    rowHeight,
    rowSpacing,
    graph,
    active,
    style,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    prefix,
    cssVar,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const graphShape = graph === true ? 'square' : graph;
  const styles = (0, _utils.mergeStyles)(style, cssVar('row-height', rowHeight, _utils.getCssValue), cssVar('row-spacing', rowSpacing, _utils.getCssValue));
  const rowElements = (0, _react.useMemo)(() => {
    const rowArr = [];
    for (let i = 0; i < rows; i++) {
      rowArr.push(/*#__PURE__*/_react.default.createElement("div", {
        key: i,
        className: prefix`row`
      }));
    }
    return rowArr;
  }, [prefix, rows]);
  const classes = merge(className, withPrefix('paragraph'));
  const graphClasses = prefix('paragraph-graph');
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles,
    "data-active": active
  }, rest), graphShape && /*#__PURE__*/_react.default.createElement("div", {
    className: graphClasses,
    "data-shape": graphShape
  }, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('paragraph-graph-inner')
  })), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('paragraph-group')
  }, rowElements));
});
PlaceholderParagraph.displayName = 'PlaceholderParagraph';
var _default = exports.default = PlaceholderParagraph;