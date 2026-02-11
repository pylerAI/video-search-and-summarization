'use client';
"use strict";

exports.__esModule = true;
exports.TREE_NODE_DROP_POSITION = exports.STATUS = exports.SIZE = exports.PLACEMENT_AUTO = exports.PLACEMENT_8 = exports.PLACEMENT_4 = exports.PLACEMENT = exports.KEY_VALUES = exports.DATERANGE_DISABLED_TARGET = exports.COLOR = exports.CHECK_STATE = exports.BREAKPOINTS = void 0;
const SIZE = exports.SIZE = ['xs', 'sm', 'md', 'lg'];
const BREAKPOINTS = exports.BREAKPOINTS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
const STATUS = exports.STATUS = ['success', 'warning', 'error', 'info'];
const COLOR = exports.COLOR = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'violet'];
const PLACEMENT_4 = exports.PLACEMENT_4 = ['top', 'bottom', 'right', 'left'];
const PLACEMENT_8 = exports.PLACEMENT_8 = ['bottomStart', 'bottomEnd', 'topStart', 'topEnd', 'leftStart', 'rightStart', 'leftEnd', 'rightEnd'];
const PLACEMENT_AUTO = exports.PLACEMENT_AUTO = ['auto', 'autoVertical', 'autoVerticalStart', 'autoVerticalEnd', 'autoHorizontal', 'autoHorizontalStart', 'autoHorizontalEnd'];
const PLACEMENT = exports.PLACEMENT = [...PLACEMENT_4, ...PLACEMENT_8, ...PLACEMENT_AUTO];

/**
 *  Check Tree Node State
 */
let CHECK_STATE = exports.CHECK_STATE = /*#__PURE__*/function (CHECK_STATE) {
  CHECK_STATE[CHECK_STATE["UNCHECK"] = 0] = "UNCHECK";
  CHECK_STATE[CHECK_STATE["CHECK"] = 1] = "CHECK";
  CHECK_STATE[CHECK_STATE["INDETERMINATE"] = 2] = "INDETERMINATE";
  return CHECK_STATE;
}({});
/**
 * Tree Node Drag Type
 */
let TREE_NODE_DROP_POSITION = exports.TREE_NODE_DROP_POSITION = /*#__PURE__*/function (TREE_NODE_DROP_POSITION) {
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER"] = 0] = "DRAG_OVER";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_TOP"] = 1] = "DRAG_OVER_TOP";
  TREE_NODE_DROP_POSITION[TREE_NODE_DROP_POSITION["DRAG_OVER_BOTTOM"] = 2] = "DRAG_OVER_BOTTOM";
  return TREE_NODE_DROP_POSITION;
}({});
/**
 * UI Events KeyboardEvent key Values
 * https://www.w3.org/TR/uievents-key
 */
const KEY_VALUES = exports.KEY_VALUES = {
  // Navigation Keys
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  END: 'End',
  HOME: 'Home',
  PAGE_DOWN: 'PageDown',
  PAGE_UP: 'PageUp',
  // Whitespace Keys
  ENTER: 'Enter',
  TAB: 'Tab',
  SPACE: ' ',
  // Editing Keys
  BACKSPACE: 'Backspace',
  DELETE: 'Delete',
  COMMA: ',',
  // UI Keys
  ESC: 'Escape'
};
let DATERANGE_DISABLED_TARGET = exports.DATERANGE_DISABLED_TARGET = /*#__PURE__*/function (DATERANGE_DISABLED_TARGET) {
  DATERANGE_DISABLED_TARGET["CALENDAR"] = "CALENDAR";
  DATERANGE_DISABLED_TARGET["TOOLBAR_BUTTON_OK"] = "TOOLBAR_BUTTON_OK";
  DATERANGE_DISABLED_TARGET["TOOLBAR_SHORTCUT"] = "TOOLBAR_SHORTCUT";
  DATERANGE_DISABLED_TARGET["INPUT"] = "INPUT";
  return DATERANGE_DISABLED_TARGET;
}({});