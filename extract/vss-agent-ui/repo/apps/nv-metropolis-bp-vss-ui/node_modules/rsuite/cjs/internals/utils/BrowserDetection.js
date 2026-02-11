'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.isIE = exports.isAndroid = void 0;
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
// from http://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser

// Internet Explorer 6-11
const isIE = () => _canUseDOM.default && /MSIE |Trident\/|Edge\//.test(window.navigator.userAgent);
exports.isIE = isIE;
const isAndroid = () => _canUseDOM.default && /Android/i.test(navigator.userAgent);
exports.isAndroid = isAndroid;