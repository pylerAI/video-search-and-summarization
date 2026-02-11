'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.DisclosureActionTypes = void 0;
var _react = _interopRequireDefault(require("react"));
let DisclosureActionTypes = exports.DisclosureActionTypes = /*#__PURE__*/function (DisclosureActionTypes) {
  DisclosureActionTypes[DisclosureActionTypes["Show"] = 0] = "Show";
  DisclosureActionTypes[DisclosureActionTypes["Hide"] = 1] = "Hide";
  return DisclosureActionTypes;
}({});
const DisclosureContext = /*#__PURE__*/_react.default.createContext(null);
DisclosureContext.displayName = 'Disclosure.Context';
var _default = exports.default = DisclosureContext;