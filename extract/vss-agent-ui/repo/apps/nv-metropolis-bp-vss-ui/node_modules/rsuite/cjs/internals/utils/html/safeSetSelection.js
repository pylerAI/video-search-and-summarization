'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.safeSetSelection = safeSetSelection;
var _BrowserDetection = require("../BrowserDetection");
const strNone = 'none';

/**
 * Sets the selection range of an HTMLInputElement safely.
 */
function safeSetSelection(element, selectionStart, selectionEnd) {
  if (document.activeElement === element) {
    if ((0, _BrowserDetection.isAndroid)()) {
      requestAnimationFrame(() => element.setSelectionRange(selectionStart, selectionEnd, strNone));
    } else {
      element.setSelectionRange(selectionStart, selectionEnd, strNone);
    }
  }
}
var _default = exports.default = safeSetSelection;