'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useUniqueId = useUniqueId;
var _react = require("react");
/**
 * Used for generating unique ID for DOM elements
 *
 * @param idProp If id is provided, it will be used instead of generating a new one
 */
function useUniqueId(prefix, idProp) {
  const generatedId = (0, _react.useId)();
  return idProp !== null && idProp !== void 0 ? idProp : `${prefix}${generatedId}`;
}
var _default = exports.default = useUniqueId;