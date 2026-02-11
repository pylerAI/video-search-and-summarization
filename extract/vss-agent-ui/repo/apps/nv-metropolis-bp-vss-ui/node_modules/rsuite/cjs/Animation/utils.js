'use client';
"use strict";

exports.__esModule = true;
exports.getAnimationEnd = getAnimationEnd;
function getAnimationEnd() {
  const style = document.createElement('div').style;
  if ('webkitAnimation' in style) {
    return 'webkitAnimationEnd';
  }
  return 'animationend';
}