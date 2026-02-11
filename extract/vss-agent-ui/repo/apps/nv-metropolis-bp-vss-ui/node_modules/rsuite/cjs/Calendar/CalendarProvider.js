'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.CalendarProvider = exports.CalendarContext = void 0;
var _react = _interopRequireDefault(require("react"));
/**
 * Represents the inner context value for the Calendar component.
 */

const CalendarContext = exports.CalendarContext = /*#__PURE__*/_react.default.createContext({});
const CalendarProvider = exports.CalendarProvider = CalendarContext.Provider;