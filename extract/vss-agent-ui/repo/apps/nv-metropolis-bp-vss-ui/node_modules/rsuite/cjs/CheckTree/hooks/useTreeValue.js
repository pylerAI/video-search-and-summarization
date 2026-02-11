'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _hooks = require("../../internals/hooks");
var _utils = require("../utils");
function useTreeValue(controlledValue, {
  defaultValue,
  uncheckableItemValues
}) {
  const [value, setValue, isControlled] = (0, _hooks.useControlled)(controlledValue, defaultValue);
  (0, _hooks.useMount)(() => {
    setValue((0, _utils.getCheckTreeDefaultValue)(value, uncheckableItemValues));
  });
  return [value, setValue, isControlled];
}
var _default = exports.default = useTreeValue;