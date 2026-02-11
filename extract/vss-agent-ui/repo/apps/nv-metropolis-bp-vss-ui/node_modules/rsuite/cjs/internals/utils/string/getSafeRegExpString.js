'use client';
"use strict";

exports.__esModule = true;
exports.getSafeRegExpString = getSafeRegExpString;
/**
 * @description escape Regular_Expressions special_characters '^$.|*+?{\\[()'
 */
function getSafeRegExpString(str) {
  const specialChars = '\\^$.|?*+()[]{}';
  return str.replace(new RegExp(`([${specialChars}])`, 'g'), '\\$1');
}