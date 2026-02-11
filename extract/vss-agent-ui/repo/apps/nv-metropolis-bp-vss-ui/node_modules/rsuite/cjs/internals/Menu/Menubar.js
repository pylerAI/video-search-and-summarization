'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = Menubar;
var _react = _interopRequireWildcard(require("react"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _useMenu = _interopRequireDefault(require("./useMenu"));
var _MenuContext = _interopRequireWildcard(require("./MenuContext"));
var _constants = require("../constants");
var _hooks = require("../hooks");
var _utils = require("../utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Headless ARIA `menubar`

/**
 * @private
 */
function Menubar({
  vertical = false,
  children,
  onActivateItem
}) {
  var _items$activeItemInde3;
  const menubar = (0, _useMenu.default)({
    role: 'menubar'
  });
  const [{
    items,
    activeItemIndex
  }, dispatch] = menubar;
  const menubarElementRef = (0, _react.useRef)(null);
  const onFocus = (0, _react.useCallback)(event => {
    // Focus moves inside Menubar
    if ((0, _utils.isFocusEntering)(event) &&
    // Skip if focus is moving to a focusable element within this menu
    !(event.target !== event.currentTarget && (0, _utils.isFocusableElement)(event.target))) {
      const disabled = event.target.getAttribute('aria-disabled');

      // Skip if the item is disabled
      if (activeItemIndex === null && disabled !== 'true') {
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
      }
    }
  }, [activeItemIndex, dispatch]);
  const onBlur = (0, _react.useCallback)(event => {
    // Focus moves outside of Menubar
    if ((0, _utils.isFocusLeaving)(event)) {
      dispatch({
        type: _MenuContext.MenuActionTypes.MoveFocus,
        to: _MenuContext.MoveFocusTo.None
      });
    }
  }, [dispatch]);
  const {
    rtl
  } = (0, _hooks.useCustom)();
  const onKeyDown = (0, _react.useCallback)(event => {
    var _items$activeItemInde, _items$activeItemInde2;
    const activeItemElement = (0, _isNil.default)(activeItemIndex) ? null : (_items$activeItemInde = (_items$activeItemInde2 = items[activeItemIndex]) === null || _items$activeItemInde2 === void 0 ? void 0 : _items$activeItemInde2.element) !== null && _items$activeItemInde !== void 0 ? _items$activeItemInde : null;
    switch (true) {
      case !vertical && !rtl && event.key === _constants.KEY_VALUES.RIGHT:
      case !vertical && rtl && event.key === _constants.KEY_VALUES.LEFT:
      case vertical && event.key === _constants.KEY_VALUES.DOWN:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Next
        });
        break;
      case !vertical && !rtl && event.key === _constants.KEY_VALUES.LEFT:
      case !vertical && rtl && event.key === _constants.KEY_VALUES.RIGHT:
      case vertical && event.key === _constants.KEY_VALUES.UP:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Prev
        });
        break;
      case event.key === _constants.KEY_VALUES.HOME:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.First
        });
        break;
      case event.key === _constants.KEY_VALUES.END:
        event.preventDefault();
        event.stopPropagation();
        dispatch({
          type: _MenuContext.MenuActionTypes.MoveFocus,
          to: _MenuContext.MoveFocusTo.Last
        });
        break;
      case !vertical && event.key === _constants.KEY_VALUES.DOWN:
      case vertical && !rtl && event.key === _constants.KEY_VALUES.RIGHT:
      case vertical && rtl && event.key === _constants.KEY_VALUES.LEFT:
        if ((activeItemElement === null || activeItemElement === void 0 ? void 0 : activeItemElement.getAttribute('aria-haspopup')) === 'menu') {
          event.preventDefault();
          event.stopPropagation();
          activeItemElement.click();
        }
        break;
      case event.key === _constants.KEY_VALUES.ENTER:
      case event.key === _constants.KEY_VALUES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        activeItemElement === null || activeItemElement === void 0 || activeItemElement.click();
        break;
    }
  }, [rtl, items, activeItemIndex, dispatch, vertical]);

  // Only used for handling click events bubbling from children
  // Which indicates that a child menuitem is being activated
  const onClick = (0, _react.useCallback)(event => {
    if (items.some(item => item.element === event.target)) {
      onActivateItem === null || onActivateItem === void 0 || onActivateItem(event);
    }
  }, [items, onActivateItem]);
  return /*#__PURE__*/_react.default.createElement(_MenuContext.default.Provider, {
    value: menubar
  }, children({
    role: 'menubar',
    tabIndex: 0,
    onFocus,
    onBlur,
    onKeyDown,
    onClick,
    'aria-activedescendant': (0, _isNil.default)(activeItemIndex) ? undefined : (_items$activeItemInde3 = items[activeItemIndex]) === null || _items$activeItemInde3 === void 0 ? void 0 : _items$activeItemInde3.element.id,
    'aria-orientation': vertical ? 'vertical' : undefined // implicitly set 'horizontal'
  }, menubarElementRef));
}