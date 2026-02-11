'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _MenuContext = _interopRequireWildcard(require("./MenuContext"));
var _hooks = require("../hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Headless ARIA `menuitem`
 * @private
 */
function MenuItem(props) {
  var _menuState$items$menu;
  const {
    children,
    selected = false,
    disabled = false,
    onActivate
  } = props;
  const menuitemRef = (0, _react.useRef)(null);
  const menuitemId = (0, _hooks.useUniqueId)('menuitem-');
  const menu = (0, _react.useContext)(_MenuContext.default);
  if (!menu) {
    throw new Error('<Menu.Item> must be rendered within a <Menu>, and <Menu> does not support nested <Menu>');
  }
  const [menuState, dispatch] = menu;

  // Whether this menuitem has focus (indicated by `aria-activedescendant` from parent menu)
  const hasFocus = !(0, _isNil.default)(menuitemRef.current) && !(0, _isNil.default)(menuState.activeItemIndex) && ((_menuState$items$menu = menuState.items[menuState.activeItemIndex]) === null || _menuState$items$menu === void 0 ? void 0 : _menuState$items$menu.element) === menuitemRef.current;
  const handleClick = (0, _react.useCallback)(event => {
    if (disabled) {
      return;
    }
    onActivate === null || onActivate === void 0 || onActivate(event);
  }, [disabled, onActivate]);

  // Gain/release focus on mousedown in `menubar`

  const handleMouseDown = (0, _react.useCallback)(() => {
    if (!(0, _isNil.default)(menuitemRef.current) && !hasFocus) {
      dispatch({
        type: _MenuContext.MenuActionTypes.MoveFocus,
        to: _MenuContext.MoveFocusTo.Specific,
        id: menuitemRef.current.id
      });
    }
  }, [dispatch, hasFocus]);

  // Gain/release focus on mouseenter/mouseleave in `menu`
  const handleMouseMove = (0, _react.useCallback)(() => {
    if (!(0, _isNil.default)(menuitemRef.current) && !hasFocus) {
      dispatch({
        type: _MenuContext.MenuActionTypes.MoveFocus,
        to: _MenuContext.MoveFocusTo.Specific,
        id: menuitemRef.current.id
      });
    }
  }, [hasFocus, dispatch]);
  const handleMouseLeave = (0, _react.useCallback)(() => {
    dispatch({
      type: _MenuContext.MenuActionTypes.MoveFocus,
      to: _MenuContext.MoveFocusTo.None
    });
  }, [dispatch]);
  (0, _react.useEffect)(() => {
    const menuitemElement = menuitemRef.current;
    if (menuitemElement) {
      dispatch({
        type: _MenuContext.MenuActionTypes.RegisterItem,
        element: menuitemElement,
        props: {
          disabled
        }
      });
      return () => {
        dispatch({
          type: _MenuContext.MenuActionTypes.UnregisterItem,
          id: menuitemElement.id
        });
      };
    }
  }, [menuitemRef, disabled, dispatch]);
  const menuitemProps = {
    id: menuitemId,
    role: 'menuitem',
    // fixme Only use `aria-checked` on menuitemradio and menuitemcheckbox
    'aria-checked': selected || undefined,
    'aria-disabled': disabled || undefined,
    tabIndex: -1,
    onClick: handleClick,
    // render props

    selected,
    active: hasFocus
  };

  // Only move focus on hover in a `menu`, not `menubar`
  if ((menuState === null || menuState === void 0 ? void 0 : menuState.role) === 'menu') {
    menuitemProps.onMouseMove = handleMouseMove;
    menuitemProps.onMouseLeave = handleMouseLeave;
  }
  if ((menuState === null || menuState === void 0 ? void 0 : menuState.role) === 'menubar') {
    menuitemProps.onMouseDown = handleMouseDown;
    menuitemProps.onMouseOver = handleMouseMove;
    menuitemProps.onMouseLeave = handleMouseLeave;
  }
  return children(menuitemProps, menuitemRef);
}
MenuItem.displayName = 'MenuItem';
var _default = exports.default = MenuItem;