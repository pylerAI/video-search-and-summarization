'use client';
"use strict";

exports.__esModule = true;
exports.convertSize = void 0;
const convertSize = size => {
  switch (size) {
    case 'lg':
      return 'lg';
    case 'sm':
    case 'xs':
      return 'sm';
    default:
      return 'md';
  }
};
exports.convertSize = convertSize;