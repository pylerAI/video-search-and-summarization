'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _PanelHeader = _interopRequireDefault(require("./PanelHeader"));
var _PanelBody = _interopRequireDefault(require("./PanelBody"));
var _useExpanded = _interopRequireDefault(require("./hooks/useExpanded"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _PanelGroup = require("../PanelGroup");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Panel` component is used to display content that can be collapsed.
 * @see https://rsuitejs.com/components/panel
 */
const Panel = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Panel', props);
  const {
    as,
    bodyFill,
    bodyProps,
    bordered,
    children,
    className,
    classPrefix = 'panel',
    caretAs,
    collapsible: collapsibleProp,
    defaultExpanded,
    disabled,
    eventKey,
    expanded: expandedProp,
    header,
    headerRole,
    panelRole = 'region',
    shaded,
    scrollShadow,
    id: idProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const id = (0, _hooks.useUniqueId)('rs-', idProp);
  const bodyId = `${id}-panel`;
  const buttonId = `${id}-btn`;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    onGroupSelect
  } = (0, _react.useContext)(_PanelGroup.PanelGroupContext) || {};
  const [expanded, setExpanded, collapsible] = (0, _useExpanded.default)({
    expanded: expandedProp,
    defaultExpanded,
    eventKey,
    collapsible: collapsibleProp
  });
  const handleSelect = (0, _hooks.useEventCallback)(event => {
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    onGroupSelect === null || onGroupSelect === void 0 || onGroupSelect(eventKey, event);
    setExpanded(!expanded);
  });
  const classes = merge(className, withPrefix({
    in: expanded,
    collapsible,
    bordered,
    shaded
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    id: idProp
  }, rest), header && /*#__PURE__*/_react.default.createElement(_PanelHeader.default, {
    collapsible: collapsible,
    expanded: expanded,
    caretAs: caretAs,
    role: headerRole,
    buttonId: buttonId,
    bodyId: bodyId,
    disabled: disabled,
    onClickButton: handleSelect
  }, header), /*#__PURE__*/_react.default.createElement(_PanelBody.default, (0, _extends2.default)({
    collapsible: collapsible,
    expanded: expanded,
    bodyFill: bodyFill,
    role: panelRole,
    id: bodyId,
    scrollShadow: scrollShadow,
    labelId: buttonId,
    onEnter: onEnter,
    onEntering: onEntering,
    onEntered: onEntered,
    onExit: onExit,
    onExiting: onExiting,
    onExited: onExited
  }, bodyProps), children));
});
Panel.displayName = 'Panel';
var _default = exports.default = Panel;