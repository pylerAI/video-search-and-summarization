'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/PagePrevious"));
var _PageNext = _interopRequireDefault(require("@rsuite/icons/PageNext"));
var _Disclosure = _interopRequireDefault(require("../internals/Disclosure"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _NavbarContext = require("./NavbarContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a <Nav.Menu> within a <Navbar>
 *
 * <Navbar>
 *   <Nav>
 *     <Nav.Menu>
 *       <Nav.Menu title="menu"> -> This submenu will render <NavbarDropdownMenu> component
 *       </Nav.Menu>
 *     </Nav.Menu>
 *   </Nav>
 * </Navbar>
 */
const NavbarDropdownMenu = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const navbar = (0, _react.useContext)(_NavbarContext.NavbarContext);
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!navbar || !nav) {
    throw new Error('<Navbar.Dropdown.Menu> must be rendered within a <Nav> within a <Navbar> component.');
  }
  const {
    onToggle,
    eventKey,
    title,
    classPrefix = 'dropdown-menu',
    children,
    openDirection = 'end',
    ...rest
  } = props;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const {
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  const {
    merge: mergeItemClassNames,
    withPrefix: withItemClassPrefix,
    prefix: prefixItemClassName
  } = (0, _hooks.useStyles)('dropdown-item');

  // Parent menu exists. This is a submenu.
  // Should render a `menuitem` that controls this submenu.
  const {
    icon,
    className,
    disabled,
    ...menuProps
  } = (0, _omit.default)(rest, ['trigger']);
  const Icon = rtl ? _PagePrevious.default : _PageNext.default;
  return /*#__PURE__*/_react.default.createElement(_Disclosure.default, {
    hideOnClickOutside: true,
    trigger: ['click', 'hover'],
    onToggle: (open, event) => onToggle === null || onToggle === void 0 ? void 0 : onToggle(open, undefined, event)
  }, ({
    open,
    ...props
  }, containerRef) => {
    const classes = mergeItemClassNames(className, withItemClassPrefix('submenu'));
    return /*#__PURE__*/_react.default.createElement("li", (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(ref, containerRef),
      className: classes,
      "data-open": open,
      "data-disabled": disabled
    }, props), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Button, null, ({
      open,
      ...buttonProps
    }, buttonRef) => {
      const classes = mergeItemClassNames(className, prefixItemClassName`toggle`, withItemClassPrefix());
      const dataAttributes = {
        'data-open': open,
        'data-disabled': disabled,
        'data-with-icon': !!icon,
        'data-event-key': eventKey
      };
      if (!(0, _isNil.default)(eventKey) && typeof eventKey !== 'string') {
        dataAttributes['data-event-key-type'] = typeof eventKey;
      }
      return /*#__PURE__*/_react.default.createElement("div", (0, _extends2.default)({
        ref: (0, _utils.mergeRefs)(buttonRef, buttonRef),
        className: classes
      }, dataAttributes, buttonProps), icon && /*#__PURE__*/_react.default.cloneElement(icon, {
        className: prefix('menu-icon')
      }), title, /*#__PURE__*/_react.default.createElement(Icon, {
        className: prefix`toggle-icon`
      }));
    }), /*#__PURE__*/_react.default.createElement(_Disclosure.default.Content, null, ({
      open
    }, elementRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
      return /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
        ref: elementRef,
        className: menuClassName,
        hidden: !open,
        "data-direction": openDirection
      }, menuProps), children);
    }));
  });
});
NavbarDropdownMenu.displayName = 'Nav.Dropdown.Menu';
var _default = exports.default = NavbarDropdownMenu;