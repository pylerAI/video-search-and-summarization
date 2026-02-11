'use client';
"use strict";

exports.__esModule = true;
exports.initialState = exports.DropdownActionType = void 0;
exports.reducer = reducer;
const initialState = exports.initialState = {
  items: []
};
let DropdownActionType = exports.DropdownActionType = /*#__PURE__*/function (DropdownActionType) {
  DropdownActionType[DropdownActionType["RegisterItem"] = 0] = "RegisterItem";
  DropdownActionType[DropdownActionType["UnregisterItem"] = 1] = "UnregisterItem";
  DropdownActionType[DropdownActionType["UpdateItem"] = 2] = "UpdateItem";
  return DropdownActionType;
}({});
function reducer(state = initialState, action) {
  switch (action.type) {
    case DropdownActionType.RegisterItem:
      if (state.items.find(item => item.id === action.payload.id)) {
        return {
          ...state,
          items: state.items.map(item => {
            if (item.id === action.payload.id) {
              return {
                ...item,
                props: {
                  ...item.props,
                  selected: action.payload.props.selected
                }
              };
            }
            return item;
          })
        };
      }
      return {
        ...state,
        items: [...state.items, {
          id: action.payload.id,
          props: action.payload.props
        }]
      };
    case DropdownActionType.UnregisterItem:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    default:
      return state;
  }
}