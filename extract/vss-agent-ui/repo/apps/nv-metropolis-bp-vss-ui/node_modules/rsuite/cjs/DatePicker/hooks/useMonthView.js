'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../../internals/hooks");
function useMonthView(props) {
  const {
    onToggleMonthDropdown
  } = props;
  const [monthView, setMonthView] = (0, _react.useState)(false);

  /**
   * The callback triggered after the month selection box is opened or closed.
   */
  const toggleMonthView = (0, _hooks.useEventCallback)(show => {
    onToggleMonthDropdown === null || onToggleMonthDropdown === void 0 || onToggleMonthDropdown(show);
    setMonthView(show);
  });
  return {
    monthView,
    setMonthView,
    toggleMonthView
  };
}
var _default = exports.default = useMonthView;