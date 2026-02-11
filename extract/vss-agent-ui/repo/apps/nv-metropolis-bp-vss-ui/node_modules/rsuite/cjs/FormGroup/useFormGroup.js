'use client';
"use strict";

exports.__esModule = true;
exports.useFormGroup = void 0;
var _react = require("react");
var _hooks = require("../internals/hooks");
var _FormGroupContext = require("./FormGroupContext");
const useFormGroup = controlId => {
  const context = (0, _react.useContext)(_FormGroupContext.FormGroupContext);
  const fallbackId = (0, _hooks.useUniqueId)('rs-');
  const id = controlId || context.controlId || fallbackId;
  const helpTextId = `${id}-help-text`;
  const labelId = `${id}-label`;
  const errorMessageId = `${id}-error-message`;
  return {
    /**
     * The `id` of the `<Form.Control>` component.
     */
    controlId: id,
    /**
     * The `id` of the `<Form.HelpText>` component.
     */
    helpTextId,
    /**
     * The `id` of the `<Form.ControlLabel>` component.
     */
    labelId,
    /**
     * The `id` of the `<Form.ErrorMessage>` component.
     */
    errorMessageId
  };
};
exports.useFormGroup = useFormGroup;