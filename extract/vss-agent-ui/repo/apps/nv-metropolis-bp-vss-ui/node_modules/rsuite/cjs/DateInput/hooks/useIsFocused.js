'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useIsFocused = useIsFocused;
var _react = require("react");
function useIsFocused({
  onFocus: onFocusProp,
  onBlur: onBlurProp
}) {
  const [isFocused, setIsFocused] = (0, _react.useState)(false);
  const onFocus = (0, _react.useCallback)(event => {
    setIsFocused(true);
    onFocusProp === null || onFocusProp === void 0 || onFocusProp(event);
  }, [onFocusProp]);
  const onBlur = (0, _react.useCallback)(event => {
    setIsFocused(false);
    onBlurProp === null || onBlurProp === void 0 || onBlurProp(event);
  }, [onBlurProp]);
  return [isFocused, {
    onFocus,
    onBlur
  }];
}
var _default = exports.default = useIsFocused;