'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ArrowLeftLine = _interopRequireDefault(require("@rsuite/icons/ArrowLeftLine"));
var _IconButton = _interopRequireDefault(require("../IconButton"));
var _utils = require("../internals/utils");
var _SidenavContext = require("./SidenavContext");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const SidenavToggle = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  if (!sidenav) {
    console.error('<Sidenav.Toggle> must be rendered within a <Sidenav>');
    return null;
  }
  const {
    className,
    classPrefix = 'sidenav-toggle',
    onToggle,
    onClick,
    ...rest
  } = props;
  const expanded = sidenav.expanded;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    collapsed: !expanded
  }));
  const handleToggle = (0, _hooks.useEventCallback)(event => {
    onToggle === null || onToggle === void 0 || onToggle(!expanded, event);
    onClick === null || onClick === void 0 || onClick(event);
  });
  return /*#__PURE__*/_react.default.createElement(_IconButton.default, (0, _extends2.default)({
    ref: ref,
    className: classes,
    icon: /*#__PURE__*/_react.default.createElement(_ArrowLeftLine.default, {
      "aria-label": ""
    }),
    onClick: handleToggle,
    "aria-label": expanded ? 'Collapse' : 'Expand'
  }, rest));
});
SidenavToggle.displayName = 'Sidenav.Toggle';
var _default = exports.default = SidenavToggle;