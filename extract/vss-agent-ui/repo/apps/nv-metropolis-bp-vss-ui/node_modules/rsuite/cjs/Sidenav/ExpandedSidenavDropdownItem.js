'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _Ripple = _interopRequireDefault(require("../internals/Ripple"));
var _SafeAnchor = _interopRequireDefault(require("../internals/SafeAnchor"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _SidenavContext = require("./SidenavContext");
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Tree View Node
 * @see https://www.w3.org/TR/wai-aria-practices-1.2/#TreeView
 */
const ExpandedSidenavDropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!sidenav || !nav) {
    throw new Error('<SidenavDropdownItem> component is not supposed to be used standalone. Use <Nav.Item> within <Sidenav> instead.');
  }
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'dropdown-item',
    children,
    disabled,
    divider,
    panel,
    className,
    style,
    icon,
    eventKey,
    onClick,
    onSelect,
    ...rest
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const selected = activeProp !== null && activeProp !== void 0 ? activeProp : !(0, _isNil.default)(eventKey) && ((0, _utils.shallowEqual)(eventKey, sidenav.activeKey) || (0, _utils.shallowEqual)(nav.activeKey, eventKey));
  const classes = merge(className, withPrefix());
  const dataAttributes = {
    'data-active': selected,
    'data-disabled': disabled,
    'data-with-icon': !!icon
  };
  const handleClick = (0, _react.useCallback)(event => {
    var _nav$onSelect, _sidenav$onSelect;
    if (disabled) return;
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 || _nav$onSelect.call(nav, eventKey, event);
    (_sidenav$onSelect = sidenav.onSelect) === null || _sidenav$onSelect === void 0 || _sidenav$onSelect.call(sidenav, eventKey, event);
  }, [disabled, onSelect, sidenav, eventKey, nav]);
  const menuitemEventHandlers = {
    onClick: (0, _utils.createChainedFunction)(handleClick, onClick)
  };
  const renderDropdownItem = (0, _useRenderMenuItem.useRenderMenuItem)(as);
  if (divider) {
    return renderDropdownItem({
      ref,
      role: 'separator',
      style,
      className: merge(prefix('divider'), className),
      ...rest
    });
  }
  if (panel) {
    return renderDropdownItem({
      ref,
      role: 'none presentation',
      style,
      className: merge(prefix('panel'), className),
      ...rest,
      children
    });
  }
  return renderDropdownItem({
    ref,
    ...rest,
    style,
    className: classes,
    'aria-current': selected || undefined,
    ...dataAttributes,
    ...menuitemEventHandlers,
    children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
      className: merge(prefix('menu-icon'), icon.props.className)
    }), children, /*#__PURE__*/_react.default.createElement(_Ripple.default, null))
  }, _SafeAnchor.default);
});
ExpandedSidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
var _default = exports.default = ExpandedSidenavDropdownItem;