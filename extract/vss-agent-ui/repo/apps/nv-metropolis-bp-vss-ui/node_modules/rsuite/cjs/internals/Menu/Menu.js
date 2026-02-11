'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _MenuContext = _interopRequireWildcard(require("./MenuContext"));
var _useMenu = _interopRequireDefault(require("./useMenu"));
var _hooks = require("../hooks");
var _constants = require("../constants");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const defaultOpenMenuOn = ['click'];
function getMenuItemTarget(event) {
  var _event$currentTarget;
  const target = event.target;
  if (target.getAttribute('role') === 'menuitem') {
    return target;
  }
  return Array.from((_event$currentTarget = event.currentTarget) === null || _event$currentTarget === void 0 ? void 0 : _event$currentTarget.querySelectorAll('[role="menuitem"]')).find(item => {
    return item.contains(target);
  });
}

/**
 * Headless ARIA `menu`
 * @private
 */
function Menu({
  disabled,
  children,
  openMenuOn = defaultOpenMenuOn,
  defaultOpen = false,
  open: openProp,
  menuButtonText,
  renderMenuButton,
  renderMenuPopup,
  onToggleMenu
}) {
  var _items$activeItemInde;
  const buttonElementRef = (0, _react.useRef)(null);
  const menuElementRef = (0, _react.useRef)(null);
  const parentMenu = (0, _react.useContext)(_MenuContext.default);
  const isSubmenu = !!parentMenu;
  const menu = (0, _useMenu.default)({
    open: defaultOpen
  });
  const [{
    open: openState,
    items,
    activeItemIndex
  }, dispatch] = menu;
  const openControlled = typeof openProp !== 'undefined';
  const open = openControlled ? openProp : openState;
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const activeItem = (0, _isNil.default)(activeItemIndex) ? null : (_items$activeItemInde = items[activeItemIndex]) === null || _items$activeItemInde === void 0 ? void 0 : _items$activeItemInde.element;
  const {
    grab: grabFocus
  } = (0, _hooks.useFocus)(menuElementRef);
  const openMenu = (0, _react.useCallback)(event => {
    dispatch({
      type: _MenuContext.MenuActionTypes.OpenMenu
    });
    if (!event.isTrusted) {
      dispatch({
        type: _MenuContext.MenuActionTypes.MoveFocus,
        to: _MenuContext.MoveFocusTo.First
      });
    }
    onToggleMenu === null || onToggleMenu === void 0 || onToggleMenu(true, event);
    grabFocus();
  }, [dispatch, onToggleMenu, grabFocus]);
  const closeMenu = (0, _react.useCallback)((event, returnFocusToButton = true) => {
    dispatch({
      type: _MenuContext.MenuActionTypes.CloseMenu
    });
    dispatch({
      type: _MenuContext.MenuActionTypes.MoveFocus,
      to: _MenuContext.MoveFocusTo.None
    });
    onToggleMenu === null || onToggleMenu === void 0 || onToggleMenu(false, event);
    if (returnFocusToButton) {
      var _buttonElementRef$cur;
      (_buttonElementRef$cur = buttonElementRef.current) === null || _buttonElementRef$cur === void 0 || _buttonElementRef$cur.focus({
        preventScroll: true
      });
    }
  }, [dispatch, onToggleMenu, buttonElementRef]);
  const toggleMenu = (0, _react.useCallback)(event => {
    if (!open) {
      openMenu(event);
    } else {
      closeMenu(event);
    }
  }, [open, openMenu, closeMenu]);
  (0, _hooks.useClickOutside)({
    enabled: open,
    isOutside: event => {
      var _buttonElementRef$cur2, _menuElementRef$curre;
      return !((_buttonElementRef$cur2 = buttonElementRef.current) !== null && _buttonElementRef$cur2 !== void 0 && _buttonElementRef$cur2.contains(event.target)) && !((_menuElementRef$curre = menuElementRef.current) !== null && _menuElementRef$curre !== void 0 && _menuElementRef$curre.contains(event.target));
    },
    // fixme if clicking on a focusable element, don't move focus to menu button
    handle: event => closeMenu(event, !(0, _utils.isFocusableElement)(event.target))
  });

  /**
   * Keyboard interaction on menu button
   * @see https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13
   */
  const handleButtonKeydown = (0, _react.useCallback)(e => {
    switch (e.key) {
      // Open the menu
      case _constants.KEY_VALUES.ENTER:
      case _constants.KEY_VALUES.SPACE:
        e.preventDefault();
        e.stopPropagation();
        if (!open) {
          openMenu(e);
          dispatch({
            type: _MenuContext.MenuActionTypes.MoveFocus,
            to: _MenuContext.MoveFocusTo.First
          });
        } else {
          closeMenu(e);
        }
        break;
      // Open the menu (if closed) and move focus to first item
      // This is mostly useful after opening the menu with click
      case _constants.KEY_VALUES.DOWN:
        e.preventDefault();
        e.stopPropagation();
        if (!open) {
          openMenu(e);
        }
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
        break;
    }
  }, [open, openMenu, closeMenu, dispatch]);
  const handleButtonClick = (0, _react.useCallback)(event => {
    if (disabled) {
      return;
    }
    toggleMenu(event);
  }, [disabled, toggleMenu]);
  const handleButtonContextMenu = (0, _react.useCallback)(event => {
    // prevents default contextmenu
    event.preventDefault();

    // Only opens menu on right click. Left click can close the menu opened by a right click
    if (open) return;
    if (disabled) return;
    openMenu(event);
  }, [open, disabled, openMenu]);
  const buttonEventHandlers = (0, _react.useMemo)(() => {
    const buttonEventHandlers = {
      onKeyDown: handleButtonKeydown
    };

    /**
     * Bind event of trigger,
     * not used in  in the expanded state of '<Sidenav>'
     */
    if (openMenuOn !== null && openMenuOn !== void 0 && openMenuOn.includes('click')) {
      buttonEventHandlers.onClick = handleButtonClick;
    }
    if (openMenuOn !== null && openMenuOn !== void 0 && openMenuOn.includes('contextmenu')) {
      buttonEventHandlers.onContextMenu = handleButtonContextMenu;
    }
    return buttonEventHandlers;
  }, [openMenuOn, handleButtonKeydown, handleButtonClick, handleButtonContextMenu]);
  const buttonId = (0, _hooks.useUniqueId)('menubutton-');
  const menuId = (0, _hooks.useUniqueId)('menu-');
  const buttonAriaAttributes = (0, _react.useMemo)(() => {
    // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-14
    return {
      role: 'button',
      'aria-haspopup': 'menu',
      'aria-expanded': open || undefined,
      // it's recommend to remove aria-expanded when menu is hidden
      'aria-controls': menuId
    };
  }, [open, menuId]);
  const buttonProps = (0, _react.useMemo)(() => {
    return {
      id: buttonId,
      ...buttonAriaAttributes,
      ...buttonEventHandlers,
      // render props
      open
    };
  }, [buttonId, buttonAriaAttributes, buttonEventHandlers, open]);
  const customMenuButton = (0, _react.useMemo)(() => {
    return renderMenuButton === null || renderMenuButton === void 0 ? void 0 : renderMenuButton(buttonProps, buttonElementRef);
  }, [renderMenuButton, buttonProps, buttonElementRef]);
  const buttonElement = customMenuButton !== null && customMenuButton !== void 0 ? customMenuButton : /*#__PURE__*/_react.default.createElement("button", (0, _extends2.default)({
    ref: buttonElementRef
  }, buttonProps), menuButtonText);

  /**
   * Keyboard interaction on menu
   * @see https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12
   */
  const handleMenuKeydown = (0, _react.useCallback)(e => {
    switch (e.key) {
      // Move focus to previous item
      case _constants.KEY_VALUES.UP:
        e.preventDefault();
        e.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Prev
        });
        break;
      // Move focus to next item
      case _constants.KEY_VALUES.DOWN:
        e.preventDefault();
        e.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Next
        });
        break;
      // When focus is in a menu and on a menuitem that has a submenu, opens the submenu and places focus on its first item.
      case _constants.KEY_VALUES.RIGHT:
        e.preventDefault();
        e.stopPropagation();
        if (!rtl) {
          if ((activeItem === null || activeItem === void 0 ? void 0 : activeItem.getAttribute('aria-haspopup')) === 'menu') {
            activeItem.click();
          }
        } else if (isSubmenu) {
          dispatch({
            type: _MenuContext.MenuActionTypes.CloseMenu
          });
        }
        break;
      // When focus is in a submenu of an item in a menu, closes the submenu and returns focus to the parent menuitem.
      case _constants.KEY_VALUES.LEFT:
        e.preventDefault();
        e.stopPropagation();
        if (!rtl) {
          if (isSubmenu) {
            closeMenu(e);
          }
        } else if ((activeItem === null || activeItem === void 0 ? void 0 : activeItem.getAttribute('aria-haspopup')) === 'menu') {
          activeItem.click();
        }
        break;
      // Move focus to the first item
      case _constants.KEY_VALUES.HOME:
        e.preventDefault();
        e.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
        break;
      // Move focus to the last item
      case _constants.KEY_VALUES.END:
        e.preventDefault();
        e.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Last
        });
        break;
      // - When focus is on a menuitem that has a submenu, opens the submenu and places focus on its first item.
      // - Otherwise, activates the item and closes the menu.
      case _constants.KEY_VALUES.ENTER:
      case _constants.KEY_VALUES.SPACE:
        if (activeItem) {
          e.preventDefault();
          e.stopPropagation();
          activeItem.click();
          if (!activeItem.getAttribute('aria-haspopup')) {
            closeMenu(e);
          }
        }
        break;
      //  Close the menu that contains focus and return focus to the element or context,
      //  e.g., menu button or parent menuitem, from which the menu was opened.
      case _constants.KEY_VALUES.ESC:
        closeMenu(e);
        break;
    }
  }, [dispatch, activeItem, isSubmenu, rtl, closeMenu]);

  // Only used for clicks bubbling from child `menuitem`s.
  const handleMenuClick = (0, _react.useCallback)(event => {
    const target = getMenuItemTarget(event);
    if (!target) return;

    // Only handle clicks on `menuitem`s
    if (target.getAttribute('role') !== 'menuitem') return;

    // Ignore clicks on `menuitem`s that controls a submenu
    if (target.getAttribute('aria-haspopup') === 'menu') return;

    // Ignore disabled `menuitem`s
    if (target.getAttribute('aria-disabled') === 'true') return;
    closeMenu(event, !isSubmenu);
  }, [closeMenu, isSubmenu]);

  // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#wai-aria-roles-states-and-properties-13
  const menuAriaAttributes = {
    role: 'menu',
    'aria-labelledby': buttonId,
    'aria-activedescendant': activeItem === null || activeItem === void 0 ? void 0 : activeItem.id
  };
  const menuEventHandlers = {
    onClick: handleMenuClick,
    onKeyDown: handleMenuKeydown
  };
  const menuProps = {
    id: menuId,
    ...menuAriaAttributes,
    ...menuEventHandlers,
    tabIndex: 0
  };
  const customMenuPopup = renderMenuPopup === null || renderMenuPopup === void 0 ? void 0 : renderMenuPopup({
    ...menuProps,
    open
  }, menuElementRef);

  // fixme Wrong children here
  const menuElement = customMenuPopup !== null && customMenuPopup !== void 0 ? customMenuPopup : /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
    ref: menuElementRef
  }, menuProps, {
    hidden: !open
  }), children);
  const handleMouseEnter = (0, _react.useCallback)(e => {
    if (!disabled) {
      openMenu(e);
    }
  }, [disabled, openMenu]);
  const handleMouseLeave = (0, _react.useCallback)(e => {
    if (!disabled) {
      closeMenu(e);
    }
  }, [disabled, closeMenu]);
  const rootElementRef = (0, _react.useRef)(null);
  const handleContainerBlur = (0, _react.useCallback)(event => {
    /* istanbul ignore else */
    if ((0, _utils.isFocusLeaving)(event)) {
      closeMenu(event, false);
    }
  }, [closeMenu]);
  const rootEventHandlers = {
    onBlur: handleContainerBlur
  };
  if (openMenuOn !== null && openMenuOn !== void 0 && openMenuOn.includes('mouseover')) {
    rootEventHandlers.onMouseEnter = handleMouseEnter;
    rootEventHandlers.onMouseLeave = handleMouseLeave;
  }
  const rootProps = {
    ...rootEventHandlers,
    children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, buttonElement, /*#__PURE__*/_react.default.createElement(_MenuContext.default.Provider, {
      value: menu
    }, menuElement)),
    // render props
    open
  };
  if (isSubmenu) {
    rootProps.role = 'none presentation';
  }
  return children(rootProps, rootElementRef);
}
Menu.displayName = 'Menu';
var _default = exports.default = Menu;