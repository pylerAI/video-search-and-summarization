'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.KEY_GROUP_TITLE = void 0;
exports.getDataGroupBy = getDataGroupBy;
var _groupBy2 = _interopRequireDefault(require("lodash/groupBy"));
var _utils = require("../../Tree/utils");
var _symbols = require("../symbols");
const KEY_GROUP_TITLE = exports.KEY_GROUP_TITLE = 'groupTitle';
function getDataGroupBy(data, key, sort) {
  const groupMap = (0, _groupBy2.default)(data, key);
  const isSort = typeof sort === 'function';
  const groups = Object.entries(groupMap).map(([groupTitle, children]) => ({
    children: isSort ? children.sort(sort(false)) : children,
    [KEY_GROUP_TITLE]: groupTitle,
    [_symbols.RSUITE_PICKER_GROUP_KEY]: true
  }));
  if (isSort) {
    groups.sort(sort(true));
  }

  // Use DFS traverse
  // Because I want the result to be [group, child, child, group, child, child]
  // rather than [group, group, child, child, child, child]
  return (0, _utils.flattenTree)(groups, group => group.children, _utils.WalkTreeStrategy.DFS);
}
var _default = exports.default = getDataGroupBy;