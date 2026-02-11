'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _BreadcrumbItem = _interopRequireDefault(require("./BreadcrumbItem"));
var _StyledBox = _interopRequireDefault(require("../internals/StyledBox"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _BreadcrumbItem.default
};
const Separator = (0, _utils.createComponent)({
  name: 'BreadcrumbSeparator',
  componentAs: 'span',
  'aria-hidden': true
});

/**
 * The Breadcrumb component is used to indicate the current page location and navigate.
 * @see https://rsuitejs.com/components/breadcrumb
 */
const Breadcrumb = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Breadcrumb', props);
  const {
    as = 'nav',
    className,
    classPrefix = 'breadcrumb',
    children,
    ellipsis = '...',
    maxItems = 5,
    separator = '/',
    size,
    locale,
    onExpand,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const [showEllipsis, setShowEllipsis] = (0, _react.useState)(true);
  const handleClickEllipsis = (0, _hooks.useEventCallback)(event => {
    setShowEllipsis(false);
    onExpand === null || onExpand === void 0 || onExpand(event);
  });
  const content = (0, _react.useMemo)(() => {
    const count = _utils.rch.count(children);
    const items = _utils.rch.mapCloneElement(children, (item, index) => {
      const isLast = index === count - 1;
      return {
        ...item.props,
        separator: isLast ? null : /*#__PURE__*/_react.default.createElement(Separator, null, separator)
      };
    });
    if (count > maxItems && count > 2 && showEllipsis) {
      return [...items.slice(0, 1), [/*#__PURE__*/_react.default.createElement(_BreadcrumbItem.default, {
        role: "button",
        key: "ellipsis",
        title: locale === null || locale === void 0 ? void 0 : locale.expandText,
        "aria-label": locale === null || locale === void 0 ? void 0 : locale.expandText,
        separator: /*#__PURE__*/_react.default.createElement(Separator, null, separator),
        onClick: handleClickEllipsis
      }, /*#__PURE__*/_react.default.createElement("span", {
        "aria-hidden": true
      }, ellipsis))], ...items.slice(items.length - 1, items.length)];
    }
    return items;
  }, [children, ellipsis, handleClickEllipsis, locale === null || locale === void 0 ? void 0 : locale.expandText, maxItems, separator, showEllipsis]);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_StyledBox.default, (0, _extends2.default)({
    name: "breadcrumb",
    as: as,
    size: size
  }, rest, {
    ref: ref,
    className: classes
  }), /*#__PURE__*/_react.default.createElement("ol", null, content));
}, Subcomponents);
Breadcrumb.displayName = 'Breadcrumb';
var _default = exports.default = Breadcrumb;