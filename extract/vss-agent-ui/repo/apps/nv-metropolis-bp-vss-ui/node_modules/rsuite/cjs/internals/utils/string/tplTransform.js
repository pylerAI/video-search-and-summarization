'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.tplTransform = tplTransform;
var _react = _interopRequireDefault(require("react"));
const toJSX = (node, key) => typeof node !== 'undefined' ? /*#__PURE__*/_react.default.createElement("span", {
  key: key
}, node) : null;

/**
 * Transforms a pattern string by replacing placeholders with corresponding data values.
 *
 * @example
 * tplTransform('Show {0} data', <i>100</i>);
 * // output: Show <span><i>100</i></span> data
 */
function tplTransform(pattern, ...data) {
  return pattern.split(/\{(\d+)\}/).map((item, index) => index % 2 ? toJSX(data[+item], index) : toJSX(item, index)).filter(item => item !== '');
}
var _default = exports.default = tplTransform;