'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _DisclosureContext = _interopRequireWildcard(require("../internals/Disclosure/DisclosureContext"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _NavbarContext = require("./NavbarContext");
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private
 */
const NavbarDropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const navbar = (0, _react.useContext)(_NavbarContext.NavbarContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!navbar || !nav) {
    throw new Error('<Navbar.Dropdown.Item> must be rendered within a <Nav> component within a <Navbar> component.');
  }
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'dropdown-item',
    className,
    children,
    disabled,
    divider,
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
  const disclosure = (0, _react.useContext)(_DisclosureContext.default);
  const [, dispatchDisclosure] = disclosure !== null && disclosure !== void 0 ? disclosure : [];
  const handleClickNavbarDropdownItem = (0, _react.useCallback)(event => {
    dispatchDisclosure === null || dispatchDisclosure === void 0 || dispatchDisclosure({
      type: _DisclosureContext.DisclosureActionTypes.Hide,
      cascade: true
    });
    handleSelectItem === null || handleSelectItem === void 0 || handleSelectItem(event);
  }, [dispatchDisclosure, handleSelectItem]);
  const selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(nav.activeKey, eventKey);
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
  const classes = merge(className, withPrefix({
    divider,
    panel
  }));
  const dataAttributes = {
    'data-active': selected,
    'data-with-icon': !!icon,
    'data-disabled': disabled,
    'data-event-key': eventKey
  };
  if (!(0, _isNil.default)(eventKey) && typeof eventKey !== 'string') {
    dataAttributes['data-event-key-type'] = typeof eventKey;
  }
  return renderDropdownItem({
    ref,
    className: classes,
    'aria-current': selected || undefined,
    ...dataAttributes,
    ...restProps,
    onClick: (0, _utils.createChainedFunction)(handleClickNavbarDropdownItem, restProps.onClick),
    children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
      className: (0, _classnames.default)(prefix('menu-icon'), icon.props.className)
    }), children)
  });
});
NavbarDropdownItem.displayName = 'Navbar.Dropdown.Item';
var _default = exports.default = NavbarDropdownItem;