'use client';
"use strict";

exports.__esModule = true;
exports.highlightText = highlightText;
var _utils = require("../../internals/utils");
function highlightText(text, props) {
  const {
    query,
    renderMark
  } = props;
  if (!query || !text) {
    return text;
  }
  const queries = Array.isArray(query) ? query : [query];
  const regx = new RegExp(queries.map(q => (0, _utils.getSafeRegExpString)(q)).join('|'), 'ig');
  const texts = [];
  const strArr = text.split(regx);
  const highStrArr = text.match(regx);
  for (let i = 0; i < strArr.length; i++) {
    if (strArr[i]) {
      texts.push(strArr[i]);
    }
    if (highStrArr !== null && highStrArr !== void 0 && highStrArr[i]) {
      texts.push(renderMark(highStrArr[i], i));
    }
  }
  return texts;
}