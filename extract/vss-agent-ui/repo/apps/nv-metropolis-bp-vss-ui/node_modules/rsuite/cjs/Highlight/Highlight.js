'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _highlightText = require("./utils/highlightText");
function defaultRenderMark(match, index) {
  return /*#__PURE__*/_react.default.createElement("mark", {
    key: index,
    className: "rs-highlight-mark"
  }, match);
}

/**
 *
 * Highlight the matching text in the content.
 *
 * @see https://rsuitejs.com/components/highlight
 */
const Highlight = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Highlight', props);
  const {
    as,
    classPrefix = 'highlight',
    className,
    children,
    query,
    renderMark = defaultRenderMark,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const text = (0, _utils.stringifyReactNode)(children);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes
  }, rest), (0, _highlightText.highlightText)(text, {
    query,
    renderMark
  }));
});
Highlight.displayName = 'Highlight';
var _default = exports.default = Highlight;