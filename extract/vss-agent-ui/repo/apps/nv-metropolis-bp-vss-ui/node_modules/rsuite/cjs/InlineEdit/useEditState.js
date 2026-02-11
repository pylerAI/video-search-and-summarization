'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../internals/hooks");
const useEditState = props => {
  const {
    value: valueProp,
    defaultValue,
    disabled,
    onChange,
    onEdit,
    onCancel,
    onSave,
    onClick,
    onFocus,
    ...htmlProps
  } = props;
  const [isEditing, setIsEditing] = (0, _react.useState)(false);
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);

  // When editing, the value is not updated, and the original value is restored when canceling
  const [resetValue, setResetValue] = (0, _react.useState)();
  const handleClick = (0, _hooks.useEventCallback)(event => {
    if (disabled) {
      return;
    }
    onClick === null || onClick === void 0 || onClick(event);
    onEdit === null || onEdit === void 0 || onEdit(event);
    setIsEditing(true);
    setResetValue(value);
  });
  const handleFocus = (0, _hooks.useEventCallback)(event => {
    if (disabled || isEditing) return;
    onFocus === null || onFocus === void 0 || onFocus(event);
    setIsEditing(true);
    setResetValue(value);
  });
  const handleChange = (0, _hooks.useEventCallback)((value, event) => {
    setValue(value);
    onChange === null || onChange === void 0 || onChange(value, event);
  });
  const handleCancel = (0, _hooks.useEventCallback)(event => {
    var _event$stopPropagatio;
    setIsEditing(false);
    setValue(resetValue);
    onCancel === null || onCancel === void 0 || onCancel(event);
    event === null || event === void 0 || (_event$stopPropagatio = event.stopPropagation) === null || _event$stopPropagatio === void 0 || _event$stopPropagatio.call(event);
  });
  const handleSave = (0, _hooks.useEventCallback)(event => {
    var _event$stopPropagatio2;
    setIsEditing(false);
    onSave === null || onSave === void 0 || onSave(event);
    event === null || event === void 0 || (_event$stopPropagatio2 = event.stopPropagation) === null || _event$stopPropagatio2 === void 0 || _event$stopPropagatio2.call(event);
  });
  const handleKeyDown = (0, _hooks.useEventCallback)(event => {
    var _event$target;
    if (isEditing) {
      switch (event.key) {
        case 'Enter':
          if (((_event$target = event.target) === null || _event$target === void 0 ? void 0 : _event$target.tagName) === 'INPUT') {
            handleSave(event);
          }
          break;
        case 'Escape':
          handleCancel(event);
          break;
      }
    }
  });
  return {
    isEditing,
    value,
    onClick: handleClick,
    onChange: handleChange,
    onFocus: handleFocus,
    onCancel: handleCancel,
    onSave: handleSave,
    onKeyDown: handleKeyDown,
    htmlProps
  };
};
var _default = exports.default = useEditState;