'use client';
"use strict";

exports.__esModule = true;
exports.default = useMenu;
exports.initialMenuState = void 0;
exports.menuReducer = menuReducer;
var _react = require("react");
var _MenuContext = require("./MenuContext");
// Inspired by tailwindlabs/headlessui

const initialMenuState = exports.initialMenuState = {
  role: 'menu',
  open: false,
  items: [],
  activeItemIndex: null
};
function menuReducer(state, action) {
  const {
    items,
    activeItemIndex
  } = state;
  switch (action.type) {
    case _MenuContext.MenuActionTypes.RegisterItem:
      return {
        ...state,
        items: [...items, {
          element: action.element,
          props: action.props
        }]
      };
    case _MenuContext.MenuActionTypes.UnregisterItem:
      return {
        ...state,
        items: items.filter(item => item.element.id !== action.id)
      };
    case _MenuContext.MenuActionTypes.OpenMenu:
      return {
        ...state,
        open: true
      };
    case _MenuContext.MenuActionTypes.CloseMenu:
      return {
        ...state,
        open: false
      };
    case _MenuContext.MenuActionTypes.MoveFocus:
      {
        let nextActiveItemIndex = activeItemIndex;
        switch (action.to) {
          case _MenuContext.MoveFocusTo.Next:
            for (let i = activeItemIndex === null ? 0 : activeItemIndex + 1; i < items.length; i++) {
              var _items$i$props;
              if (!((_items$i$props = items[i].props) !== null && _items$i$props !== void 0 && _items$i$props.disabled)) {
                nextActiveItemIndex = i;
                break;
              }
            }
            break;
          case _MenuContext.MoveFocusTo.Prev:
            for (let i = activeItemIndex === null ? items.length - 1 : activeItemIndex - 1; i >= 0; i--) {
              var _items$i$props2;
              if (!((_items$i$props2 = items[i].props) !== null && _items$i$props2 !== void 0 && _items$i$props2.disabled)) {
                nextActiveItemIndex = i;
                break;
              }
            }
            break;
          case _MenuContext.MoveFocusTo.First:
            for (let i = 0; i < items.length; i++) {
              var _items$i$props3;
              if (!((_items$i$props3 = items[i].props) !== null && _items$i$props3 !== void 0 && _items$i$props3.disabled)) {
                nextActiveItemIndex = i;
                break;
              }
            }
            break;
          case _MenuContext.MoveFocusTo.Last:
            for (let i = items.length - 1; i >= 0; i--) {
              var _items$i$props4;
              if (!((_items$i$props4 = items[i].props) !== null && _items$i$props4 !== void 0 && _items$i$props4.disabled)) {
                nextActiveItemIndex = i;
                break;
              }
            }
            break;
          case _MenuContext.MoveFocusTo.Specific:
            for (let i = 0; i < items.length; i++) {
              var _items$i$props5;
              if (items[i].element.id === action.id && !((_items$i$props5 = items[i].props) !== null && _items$i$props5 !== void 0 && _items$i$props5.disabled)) {
                nextActiveItemIndex = i;
                break;
              }
            }
            break;
          case _MenuContext.MoveFocusTo.None:
            nextActiveItemIndex = null;
            break;
        }
        return {
          ...state,
          activeItemIndex: nextActiveItemIndex
        };
      }
    default:
      return state;
  }
}
function useMenu(initialState) {
  // `menuitem`s
  const [state, dispatch] = (0, _react.useReducer)(menuReducer, {
    ...initialMenuState,
    ...initialState
  });
  return [state, dispatch];
}