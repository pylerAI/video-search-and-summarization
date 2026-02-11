'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _Transition = _interopRequireDefault(require("../Animation/Transition"));
var _SidenavBody = _interopRequireDefault(require("./SidenavBody"));
var _SidenavHeader = _interopRequireDefault(require("./SidenavHeader"));
var _SidenavFooter = _interopRequireDefault(require("./SidenavFooter"));
var _SidenavToggle = _interopRequireDefault(require("./SidenavToggle"));
var _SidenavGroupLabel = _interopRequireDefault(require("./SidenavGroupLabel"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _SidenavContext = require("./SidenavContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const emptyArray = [];
const Subcomponents = {
  Header: _SidenavHeader.default,
  Body: _SidenavBody.default,
  Footer: _SidenavFooter.default,
  GroupLabel: _SidenavGroupLabel.default,
  Toggle: _SidenavToggle.default
};

/**
 * The `Sidenav` component is an encapsulation of the page sidebar `Nav`.
 * @see https://rsuitejs.com/components/sidenav/
 */
const Sidenav = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Sidenav', props);
  const {
    as = 'nav',
    className,
    classPrefix = 'sidenav',
    appearance = 'default',
    expanded = true,
    activeKey,
    defaultOpenKeys = emptyArray,
    openKeys: openKeysProp,
    onSelect,
    onOpenChange,
    ...rest
  } = propsWithDefaults;
  const [openKeys, setOpenKeys] = (0, _hooks.useControlled)(openKeysProp, defaultOpenKeys);
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const handleOpenChange = (0, _react.useCallback)((eventKey, event) => {
    const find = key => (0, _utils.shallowEqual)(key, eventKey);
    const nextOpenKeys = [...openKeys];
    if (nextOpenKeys.some(find)) {
      (0, _remove.default)(nextOpenKeys, find);
    } else {
      nextOpenKeys.push(eventKey);
    }
    setOpenKeys(nextOpenKeys);
    onOpenChange === null || onOpenChange === void 0 || onOpenChange(nextOpenKeys, event);
  }, [onOpenChange, openKeys, setOpenKeys]);
  const contextValue = (0, _react.useMemo)(() => ({
    expanded,
    activeKey,
    sidenav: true,
    openKeys: openKeys !== null && openKeys !== void 0 ? openKeys : [],
    onOpenChange: handleOpenChange,
    onSelect
  }), [activeKey, expanded, handleOpenChange, onSelect, openKeys]);
  return /*#__PURE__*/_react.default.createElement(_SidenavContext.SidenavContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Transition.default, {
    in: expanded,
    timeout: 300,
    exitedClassName: prefix('collapse-out'),
    exitingClassName: prefix('collapse-out', 'collapsing'),
    enteredClassName: prefix('collapse-in'),
    enteringClassName: prefix('collapse-in', 'collapsing')
  }, (transitionProps, transitionRef) => {
    const {
      className,
      ...transitionRest
    } = transitionProps;
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as
    }, rest, transitionRest, {
      ref: (0, _utils.mergeRefs)(ref, transitionRef),
      className: merge(classes, className),
      "data-appearance": appearance
    }));
  }));
}, Subcomponents);
Sidenav.displayName = 'Sidenav';
var _default = exports.default = Sidenav;