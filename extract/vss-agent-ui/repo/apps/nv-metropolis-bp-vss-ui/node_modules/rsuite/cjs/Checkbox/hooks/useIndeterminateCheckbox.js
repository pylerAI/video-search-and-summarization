'use client';
"use strict";

exports.__esModule = true;
exports.useIndeterminateCheckbox = useIndeterminateCheckbox;
var _react = require("react");
/**
 * A hook that manages the indeterminate state of a checkbox input element.
 *
 * The indeterminate state is a visual and accessibility state that cannot be set via HTML attributes.
 * It must be set via JavaScript on the DOM element itself. This is required for proper
 * screen reader support, as assistive technologies rely on the native DOM property
 * rather than ARIA attributes for native checkboxes.
 *
 * @param indeterminate - Whether the checkbox should be in an indeterminate state
 * @returns A ref object to be attached to the checkbox input element
 *
 * @example
 * ```tsx
 * const checkboxRef = useIndeterminateCheckbox(isIndeterminate);
 * return <input type="checkbox" ref={checkboxRef} />;
 * ```
 */
function useIndeterminateCheckbox(indeterminate) {
  const ref = (0, _react.useRef)(null);
  (0, _react.useLayoutEffect)(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate !== null && indeterminate !== void 0 ? indeterminate : false;
    }
  }, [indeterminate]);
  return ref;
}