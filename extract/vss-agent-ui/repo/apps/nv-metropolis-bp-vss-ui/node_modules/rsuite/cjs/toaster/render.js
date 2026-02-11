'use client';
"use strict";

exports.__esModule = true;
exports.render = render;
var _client = require("react-dom/client");
var _utils = require("../internals/utils");
var _symbols = require("../internals/symbols");
function render(element, container) {
  const mountElement = document.createElement('div');
  mountElement.className = 'rs-toaster-mount-element';
  const containerElement = container;

  // Add the detached element to the root
  containerElement.appendChild(mountElement);
  if (!containerElement[_symbols.RSUITE_TOASTER_ID]) {
    // Attach the containerId to the containerElement
    containerElement[_symbols.RSUITE_TOASTER_ID] = (0, _utils.guid)();
  }
  const root = (0, _client.createRoot)(mountElement, {
    identifierPrefix: 'rs-root-'
  });
  root.render(element);
  return containerElement[_symbols.RSUITE_TOASTER_ID];
}