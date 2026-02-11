'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _EditableControls = _interopRequireDefault(require("./EditableControls"));
var _useFocusEvent = _interopRequireDefault(require("./useFocusEvent"));
var _useEditState = _interopRequireDefault(require("./useEditState"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _renderChildren = require("./renderChildren");
const InlineEdit = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('InlineEdit', props);
  const {
    as,
    children = _renderChildren.defaultRenderInput,
    classPrefix = 'inline-edit',
    className,
    disabled,
    size = 'md',
    showControls = true,
    stateOnBlur = 'save',
    placeholder,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    value,
    isEditing,
    onSave,
    onCancel,
    onChange,
    onKeyDown,
    onClick,
    onFocus,
    htmlProps
  } = (0, _useEditState.default)({
    ...rest,
    disabled
  });
  const {
    target,
    root,
    onBlur
  } = (0, _useFocusEvent.default)({
    isEditing,
    stateOnBlur,
    onSave,
    onCancel
  });
  const childrenProps = {
    size,
    value,
    disabled,
    placeholder,
    plaintext: !isEditing,
    onChange,
    onBlur
  };
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: (0, _utils.mergeRefs)(root, ref),
    tabIndex: 0,
    className: merge(className, withPrefix()),
    onClick: onClick,
    onKeyDown: onKeyDown,
    onFocus: onFocus,
    "data-disabled": disabled,
    "data-size": size
  }, htmlProps), (0, _renderChildren.renderChildren)(children, childrenProps, target), showControls && isEditing && /*#__PURE__*/_react.default.createElement(_EditableControls.default, {
    className: prefix('controls'),
    onSave: onSave,
    onCancel: onCancel
  }));
});
InlineEdit.displayName = 'InlineEdit';
var _default = exports.default = InlineEdit;