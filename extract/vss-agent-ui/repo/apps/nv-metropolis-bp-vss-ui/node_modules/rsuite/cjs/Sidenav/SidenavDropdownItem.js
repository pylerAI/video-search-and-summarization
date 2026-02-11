'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _ExpandedSidenavDropdownItem = _interopRequireDefault(require("./ExpandedSidenavDropdownItem"));
var _utils = require("../internals/utils");
var _SidenavContext = require("./SidenavContext");
var _hooks = require("../internals/hooks");
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Item> within a <Sidenav>
 *
 * <Sidenav>
 *   <Nav>
 *     <Nav.Menu>
 *       <Nav.Item></Nav.Item> -> This will render <SidenavDropdownItem> component
 *     </Nav.Menu>
 *   </Nav>
 * </Sidenav>
 */
const SidenavDropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const sidenav = (0, _react.useContext)(_SidenavContext.SidenavContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!sidenav || !nav) {
    throw new Error('<Sidenav.Dropdown.Item> must be used within a <Nav> within a <Sidenav> component.');
  }
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'dropdown-item',
    className,
    children,
    divider,
    disabled,
    eventKey,
    icon,
    panel,
    onSelect,
    ...restProps
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleSelectItem = (0, _react.useCallback)(event => {
    var _nav$onSelect;
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    (_nav$onSelect = nav.onSelect) === null || _nav$onSelect === void 0 || _nav$onSelect.call(nav, eventKey, event);
  }, [onSelect, eventKey, nav]);
  const selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(nav === null || nav === void 0 ? void 0 : nav.activeKey, eventKey);
  const renderDropdownItem = (0, _useRenderMenuItem.useRenderMenuItem)(as);
  if (sidenav.expanded) {
    return /*#__PURE__*/_react.default.createElement(_ExpandedSidenavDropdownItem.default, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  if (divider) {
    return renderDropdownItem({
      ref,
      role: 'separator',
      className: merge(prefix('divider'), className),
      ...restProps
    });
  }
  if (panel) {
    return renderDropdownItem({
      ref,
      className: merge(prefix('panel'), className),
      children,
      ...restProps
    });
  }
  return /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
    selected: selected,
    disabled: disabled,
    onActivate: handleSelectItem
  }, ({
    selected,
    active,
    ...menuitem
  }, menuitemRef) => {
    const classes = merge(className, withPrefix({
      divider,
      panel
    }));
    const dataAttributes = {
      'data-active': selected,
      'data-disabled': disabled,
      'data-focus': active,
      'data-with-icon': !!icon,
      'data-event-key': eventKey
    };
    if (!(0, _isNil.default)(eventKey) && typeof eventKey !== 'string') {
      dataAttributes['data-event-key-type'] = typeof eventKey;
    }
    return renderDropdownItem({
      ref: (0, _utils.mergeRefs)(ref, menuitemRef),
      className: classes,
      ...menuitem,
      ...dataAttributes,
      ...restProps,
      children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
        className: (0, _classnames.default)(prefix('menu-icon'), icon.props.className)
      }), children)
    });
  });
});
SidenavDropdownItem.displayName = 'Sidenav.Dropdown.Item';
var _default = exports.default = SidenavDropdownItem;