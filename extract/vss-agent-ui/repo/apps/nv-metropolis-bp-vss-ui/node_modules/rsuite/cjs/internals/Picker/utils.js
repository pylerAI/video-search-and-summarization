'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.createConcatChildrenFunction = createConcatChildrenFunction;
exports.onMenuKeyDown = onMenuKeyDown;
exports.shouldDisplay = shouldDisplay;
var _react = _interopRequireDefault(require("react"));
var _trim = _interopRequireDefault(require("lodash/trim"));
var _constants = require("../constants");
var _utils = require("../Tree/utils");
var _utils2 = require("../utils");
const defaultNodeKeys = {
  valueKey: 'value',
  childrenKey: 'children'
};
function createConcatChildrenFunction(node, nodeValue, nodeKeys = defaultNodeKeys) {
  const {
    valueKey,
    childrenKey
  } = nodeKeys;
  return (data, children) => {
    if (nodeValue) {
      node = (0, _utils.findNodeOfTree)(data, item => nodeValue === item[valueKey]);
    }
    node[childrenKey] = children;
    return data.concat([]);
  };
}
function shouldDisplay(label, searchKeyword) {
  if (!(0, _trim.default)(searchKeyword)) {
    return true;
  }
  const keyword = searchKeyword.toLocaleLowerCase();
  if (typeof label === 'string' || typeof label === 'number') {
    return `${label}`.toLocaleLowerCase().indexOf(keyword) >= 0;
  } else if (/*#__PURE__*/_react.default.isValidElement(label)) {
    const nodes = (0, _utils2.reactToString)(label);
    return nodes.join('').toLocaleLowerCase().indexOf(keyword) >= 0;
  }
  return false;
}
/**
 * Handling keyboard events...
 * @param event Keyboard event object
 * @param events Event callback functions
 */
function onMenuKeyDown(event, events) {
  const {
    down,
    up,
    enter,
    del,
    esc,
    right,
    left,
    home,
    end
  } = events;
  switch (event.key) {
    // down
    case _constants.KEY_VALUES.DOWN:
      down === null || down === void 0 || down(event);
      event.preventDefault();
      break;
    // up
    case _constants.KEY_VALUES.UP:
      up === null || up === void 0 || up(event);
      event.preventDefault();
      break;
    // enter
    case _constants.KEY_VALUES.ENTER:
      enter === null || enter === void 0 || enter(event);
      event.preventDefault();
      break;
    // delete
    case _constants.KEY_VALUES.BACKSPACE:
      del === null || del === void 0 || del(event);
      break;
    // esc | tab
    case _constants.KEY_VALUES.ESC:
    case _constants.KEY_VALUES.TAB:
      esc === null || esc === void 0 || esc(event);
      break;
    // left arrow
    case _constants.KEY_VALUES.LEFT:
      left === null || left === void 0 || left(event);
      break;
    // right arrow
    case _constants.KEY_VALUES.RIGHT:
      right === null || right === void 0 || right(event);
      break;
    // home
    case _constants.KEY_VALUES.HOME:
      home === null || home === void 0 || home(event);
      event.preventDefault();
      break;
    // end
    case _constants.KEY_VALUES.END:
      end === null || end === void 0 || end(event);
      event.preventDefault();
      break;
    default:
  }
}