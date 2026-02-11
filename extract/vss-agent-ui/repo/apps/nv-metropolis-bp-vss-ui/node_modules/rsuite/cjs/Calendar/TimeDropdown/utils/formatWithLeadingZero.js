'use client';
"use strict";

exports.__esModule = true;
exports.formatWithLeadingZero = void 0;
const formatWithLeadingZero = number => {
  return String(number).padStart(2, '0');
};
exports.formatWithLeadingZero = formatWithLeadingZero;