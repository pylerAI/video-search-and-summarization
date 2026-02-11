'use client';
"use strict";

exports.__esModule = true;
var _exportNames = {
  guid: true,
  createChainedFunction: true,
  isOneOf: true,
  shallowEqual: true,
  shallowEqualArray: true,
  composeFunctions: true,
  getDataGroupBy: true,
  warnOnce: true,
  attachParent: true,
  isPresetSize: true
};
exports.warnOnce = exports.shallowEqualArray = exports.shallowEqual = exports.isPresetSize = exports.isOneOf = exports.guid = exports.getDataGroupBy = exports.createChainedFunction = exports.composeFunctions = exports.attachParent = void 0;
var _BrowserDetection = require("./BrowserDetection");
Object.keys(_BrowserDetection).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _BrowserDetection[key]) return;
  exports[key] = _BrowserDetection[key];
});
var _html = require("./html");
Object.keys(_html).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _html[key]) return;
  exports[key] = _html[key];
});
var _colours = require("./colours");
Object.keys(_colours).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _colours[key]) return;
  exports[key] = _colours[key];
});
var _sizes = require("./sizes");
exports.isPresetSize = _sizes.isPresetSize;
Object.keys(_sizes).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _sizes[key]) return;
  exports[key] = _sizes[key];
});
var _styleSheet = require("./style-sheet");
Object.keys(_styleSheet).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _styleSheet[key]) return;
  exports[key] = _styleSheet[key];
});
var _placement = require("./placement");
Object.keys(_placement).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _placement[key]) return;
  exports[key] = _placement[key];
});
var _string = require("./string");
Object.keys(_string).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _string[key]) return;
  exports[key] = _string[key];
});
var _react = require("./react");
Object.keys(_react).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _react[key]) return;
  exports[key] = _react[key];
});
var _guid = require("./guid");
exports.guid = _guid.guid;
var _createChainedFunction = require("./createChainedFunction");
exports.createChainedFunction = _createChainedFunction.createChainedFunction;
var _isOneOf = require("./isOneOf");
exports.isOneOf = _isOneOf.isOneOf;
var _shallowEqual = require("./shallowEqual");
exports.shallowEqual = _shallowEqual.shallowEqual;
exports.shallowEqualArray = _shallowEqual.shallowEqualArray;
var _composeFunctions = require("./composeFunctions");
exports.composeFunctions = _composeFunctions.composeFunctions;
var _getDataGroupBy = require("./getDataGroupBy");
exports.getDataGroupBy = _getDataGroupBy.getDataGroupBy;
var _warnOnce = require("./warnOnce");
exports.warnOnce = _warnOnce.warnOnce;
var _attachParent = require("./attachParent");
exports.attachParent = _attachParent.attachParent;