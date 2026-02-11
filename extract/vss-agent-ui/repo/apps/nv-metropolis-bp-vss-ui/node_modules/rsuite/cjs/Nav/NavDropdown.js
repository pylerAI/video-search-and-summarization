'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _Menu = _interopRequireDefault(require("../internals/Menu/Menu"));
var _NavContext = _interopRequireDefault(require("./NavContext"));
var _NavDropdownItem = _interopRequireDefault(require("./NavDropdownItem"));
var _NavDropdownMenu = _interopRequireDefault(require("./NavDropdownMenu"));
var _NavDropdownToggle = _interopRequireDefault(require("./NavDropdownToggle"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _DropdownState = require("../Dropdown/DropdownState");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _NavDropdownItem.default,
  Menu: _NavDropdownMenu.default
};

/**
 * @private this component is not supposed to be used directly
 *          Instead it's rendered by a `<Nav.Menu>` call
 *
 * @example
 * <Nav>
 *   <Nav.Menu> -> This will render <NavDropdown> component
 *   </Nav.Menu>
 * </Nav>
 */
const NavDropdown = (0, _utils.forwardRef)((props, ref) => {
  const nav = (0, _react.useContext)(_NavContext.default);
  if (!nav) {
    throw new Error('<Nav.Dropdown> must be rendered within a <Nav> component.');
  }
  const {
    as,
    title,
    onClose,
    onOpen,
    onToggle,
    eventKey,
    trigger = 'click',
    placement = 'bottomStart',
    toggleAs,
    toggleClassName,
    classPrefix = 'dropdown',
    className,
    disabled,
    children,
    menuStyle,
    style,
    ...toggleProps
  } = props;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  const menuButtonTriggers = (0, _react.useMemo)(() => {
    if (!trigger) {
      return undefined;
    }
    const triggerMap = {
      hover: 'mouseover',
      click: 'click',
      contextMenu: 'contextmenu'
    };
    if (!Array.isArray(trigger)) {
      return [triggerMap[trigger]];
    }
    return trigger.map(t => triggerMap[t]);
  }, [trigger]);
  const [{
    items
  }] = (0, _react.useReducer)(_DropdownState.reducer, _DropdownState.initialState);
  const hasSelectedItem = (0, _react.useMemo)(() => {
    return items.some(item => item.props.selected);
  }, [items]);
  const renderMenuButton = (menuButtonProps, menuButtonRef) => /*#__PURE__*/_react.default.createElement(_NavDropdownToggle.default, (0, _extends2.default)({
    ref: menuButtonRef,
    as: toggleAs,
    className: toggleClassName,
    placement: placement,
    disabled: disabled
  }, (0, _omit.default)(menuButtonProps, ['open']), (0, _omit.default)(toggleProps, ['data-testid'])), title);
  return /*#__PURE__*/_react.default.createElement(_Menu.default, {
    renderMenuButton: renderMenuButton,
    openMenuOn: menuButtonTriggers,
    renderMenuPopup: ({
      open,
      ...popupProps
    }, popupRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix());
      return /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
        ref: popupRef,
        className: menuClassName,
        style: menuStyle,
        hidden: !open
      }, popupProps), children);
    },
    onToggleMenu: (open, event) => {
      onToggle === null || onToggle === void 0 || onToggle(open, eventKey, event);
      if (open) {
        onOpen === null || onOpen === void 0 || onOpen();
      } else {
        onClose === null || onClose === void 0 || onClose();
      }
    }
  }, ({
    open,
    ...menuContainer
  }, menuContainerRef) => {
    const classes = merge(className, withPrefix({
      disabled,
      open
    }));
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
      as: as,
      ref: (0, _utils.mergeRefs)(ref, menuContainerRef),
      className: classes,
      style: style,
      "data-placement": (0, _utils.kebabPlace)(placement),
      "data-active-descendant": hasSelectedItem
    }, menuContainer, (0, _pick.default)(toggleProps, ['data-testid'])));
  });
}, Subcomponents);
NavDropdown.displayName = 'Nav.Dropdown';
var _default = exports.default = NavDropdown;