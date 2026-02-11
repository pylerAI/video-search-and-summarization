'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Button = _interopRequireDefault(require("../Button"));
var _PredefinedRanges = _interopRequireDefault(require("./PredefinedRanges"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _hooks = require("../internals/hooks");
const OkButton = ({
  disableOkBtn,
  calendarDate,
  onOk,
  children
}) => {
  const disabled = disableOkBtn === null || disableOkBtn === void 0 ? void 0 : disableOkBtn(calendarDate);
  return /*#__PURE__*/_react.default.createElement(_Button.default, {
    appearance: "primary",
    size: "sm",
    disabled: disabled,
    onClick: disabled ? undefined : onOk
  }, children);
};

/**
 * Toolbar for DatePicker and DateRangePicker
 */
const Toolbar = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    className,
    classPrefix = 'picker-toolbar',
    calendarDate,
    ranges,
    locale,
    hideOkBtn,
    disableOkBtn,
    disableShortcut,
    onOk,
    onShortcutClick,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  if (hideOkBtn && (ranges === null || ranges === void 0 ? void 0 : ranges.length) === 0) {
    return null;
  }
  const classes = merge(className, withPrefix());

  // If there are no ranges, the ok button should be aligned to the right
  const justify = (ranges === null || ranges === void 0 ? void 0 : ranges.length) === 0 ? 'flex-end' : 'space-between';
  return /*#__PURE__*/_react.default.createElement(_Stack.default, (0, _extends2.default)({
    ref: ref,
    className: classes,
    justify: justify,
    align: "flex-start"
  }, rest), /*#__PURE__*/_react.default.createElement(_PredefinedRanges.default, {
    wrap: true,
    className: prefix('ranges'),
    ranges: ranges,
    calendarDate: calendarDate,
    locale: locale,
    disableShortcut: disableShortcut,
    onShortcutClick: onShortcutClick,
    "data-testid": "daterange-predefined-bottom"
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('right')
  }, !hideOkBtn && /*#__PURE__*/_react.default.createElement(OkButton, {
    disableOkBtn: disableOkBtn,
    calendarDate: calendarDate,
    onOk: onOk
  }, locale === null || locale === void 0 ? void 0 : locale.ok)));
});
Toolbar.displayName = 'Toolbar';
var _default = exports.default = Toolbar;