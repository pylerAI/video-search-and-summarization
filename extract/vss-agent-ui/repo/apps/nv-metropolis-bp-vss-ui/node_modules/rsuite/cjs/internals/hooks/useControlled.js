'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useControlled = useControlled;
var _react = require("react");
/**
 * A hook for controlled value management.
 * In the case of passing the controlled value, the controlled value is returned, otherwise the value in state is returned.
 * Generally used for a component including controlled and uncontrolled modes.
 * @param controlledValue
 * @param defaultValue
 * @param formatValue
 */

function useControlled(controlledValue, defaultValue) {
  const controlledRef = (0, _react.useRef)(false);
  controlledRef.current = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = (0, _react.useState)(defaultValue);

  // If it is controlled, this directly returns the attribute value.
  const value = controlledRef.current ? controlledValue : uncontrolledValue;
  const setValue = (0, _react.useCallback)(nextValue => {
    // Only update the value in state when it is not under control.
    if (!controlledRef.current) {
      setUncontrolledValue(nextValue);
    }
  }, [controlledRef]);
  return [value, setValue, controlledRef.current];
}
var _default = exports.default = useControlled;