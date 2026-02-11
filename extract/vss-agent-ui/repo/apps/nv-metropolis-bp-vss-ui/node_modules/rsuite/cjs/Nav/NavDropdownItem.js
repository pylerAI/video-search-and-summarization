'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private
 */
const NavDropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!nav) {
    throw new Error('<Nav.Dropdown.Item> should be used within a <Nav> component.');
  }
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'dropdown-item',
    className,
    eventKey,
    icon,
    divider,
    panel,
    children,
    disabled,
    onSelect,
    ...restProps
  } = props;
  const {
    activeKey,
    onSelect: onSelectFromNav
  } = nav;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(activeKey, eventKey);
  const handleSelectItem = (0, _react.useCallback)(event => {
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    onSelectFromNav === null || onSelectFromNav === void 0 || onSelectFromNav(eventKey, event);
  }, [onSelect, eventKey, onSelectFromNav]);
  const renderDropdownItem = (0, _useRenderMenuItem.useRenderMenuItem)(as);
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
      'data-focus': active,
      'data-active': selected,
      'data-disabled': disabled,
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
NavDropdownItem.displayName = 'Nav.Dropdown.Item';
var _default = exports.default = NavDropdownItem;