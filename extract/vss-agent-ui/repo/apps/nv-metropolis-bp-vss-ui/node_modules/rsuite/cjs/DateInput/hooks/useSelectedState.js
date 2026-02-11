'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useSelectedState = useSelectedState;
var _react = require("react");
const defaultSelectedState = {
  selectedPattern: 'y',
  selectionStart: 0,
  selectionEnd: 0
};
function useSelectedState() {
  const [selectedState, setSelectedState] = (0, _react.useState)(defaultSelectedState);
  return {
    selectedState,
    setSelectedState
  };
}
var _default = exports.default = useSelectedState;