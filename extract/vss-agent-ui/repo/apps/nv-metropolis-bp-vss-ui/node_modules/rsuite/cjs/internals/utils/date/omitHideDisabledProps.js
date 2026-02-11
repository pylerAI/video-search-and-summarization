'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.omitHideDisabledProps = exports.default = void 0;
var _omitBy = _interopRequireDefault(require("lodash/omitBy"));
/**
 * Omit the calendar-only props from an object.
 *
 * @param props - The object to omit props from.
 * @returns The object with calendar-only props omitted.
 */
const omitHideDisabledProps = props => (0, _omitBy.default)(props, (_val, key) => key.startsWith('disabled') || key.startsWith('hide') || key.startsWith('shouldDisable'));
exports.omitHideDisabledProps = omitHideDisabledProps;
var _default = exports.default = omitHideDisabledProps;