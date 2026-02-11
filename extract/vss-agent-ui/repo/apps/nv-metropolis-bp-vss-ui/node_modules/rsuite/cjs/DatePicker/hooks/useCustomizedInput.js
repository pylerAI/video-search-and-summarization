'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _date = require("../../internals/utils/date");
var _Input = _interopRequireDefault(require("../../Input"));
var _DateInput = _interopRequireDefault(require("../../DateInput"));
var _DateRangeInput = _interopRequireDefault(require("../../DateRangeInput"));
function useCustomizedInput(props) {
  const {
    value,
    formatStr,
    readOnly,
    editable,
    loading,
    mode = 'date',
    renderValue
  } = props;
  const [active, setActive] = (0, _react.useState)(false);
  const onActive = (0, _react.useCallback)(() => setActive(true), []);
  const onInactive = (0, _react.useCallback)(() => setActive(false), []);

  // Custom rendering of the selected value
  let customValue = null;

  // Input box is read-only when the component is uneditable or loading state
  let inputReadOnly = readOnly || !editable || loading || false;

  // If the component is not active or editable, the custom rendering value is displayed
  const customized = !active || !editable;
  if (typeof renderValue === 'function' && value && customized) {
    if (Array.isArray(value) ? value.every(_date.isValid) : (0, _date.isValid)(value)) {
      customValue = renderValue(value, formatStr);

      // If the custom rendering value, the input box is read-only
      inputReadOnly = true;
    }
  }
  const TargetInput = mode === 'dateRange' ? _DateRangeInput.default : _DateInput.default;
  const CustomizedInput = customValue ? _Input.default : TargetInput;
  return {
    customValue,
    Input: CustomizedInput,
    inputReadOnly,
    events: {
      onActive,
      onInactive
    }
  };
}
var _default = exports.default = useCustomizedInput;