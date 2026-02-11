'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.shouldDisplay = void 0;
exports.transformData = transformData;
var _trim = _interopRequireDefault(require("lodash/trim"));
function transformData(data) {
  if (!data) {
    return [];
  }
  return data.map(item => {
    if (typeof item === 'string') {
      return {
        value: item,
        label: item
      };
    }
    if (typeof item === 'object') {
      return item;
    }
  });
}
const shouldDisplay = (filterBy, value) => {
  return item => {
    if (typeof filterBy === 'function') {
      return filterBy(value, item);
    }
    if (!(0, _trim.default)(value)) {
      return false;
    }
    const keyword = value.toLocaleLowerCase();
    return `${item.label}`.toLocaleLowerCase().indexOf(keyword) >= 0;
  };
};
exports.shouldDisplay = shouldDisplay;