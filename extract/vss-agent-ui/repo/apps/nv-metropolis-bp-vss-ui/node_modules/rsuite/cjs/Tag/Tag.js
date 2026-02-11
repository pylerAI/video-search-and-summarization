'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _CloseButton = _interopRequireDefault(require("../internals/CloseButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Tag` component is used to label and categorize.
 * It can be used to mark the status of an object or classify it into different categories.
 *
 * @see https://rsuitejs.com/components/tag
 */
const Tag = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults,
    getLocale
  } = (0, _hooks.useCustom)('Tag', props);
  const {
    as,
    classPrefix = 'tag',
    size = 'md',
    color,
    children,
    closable,
    className,
    locale: overrideLocale,
    style,
    onClose,
    ...rest
  } = propsWithDefaults;
  const {
    remove
  } = getLocale('common', overrideLocale);
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const styles = (0, _react.useMemo)(() => (0, _utils.mergeStyles)(style, (0, _utils.createColorVariables)(color, '--rs-tag-bg', '--rs-tag-text')), [style, color]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    style: styles
  }, rest, {
    "data-size": size,
    "data-color": (0, _utils.isPresetColor)(color) ? color : undefined
  }), /*#__PURE__*/_react.default.createElement("span", {
    className: prefix`text`
  }, children), closable && /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
    className: prefix`icon-close`,
    onClick: onClose,
    tabIndex: -1,
    locale: {
      closeLabel: remove
    }
  }));
});
Tag.displayName = 'Tag';
var _default = exports.default = Tag;