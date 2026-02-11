'use client';
"use strict";

exports.__esModule = true;
exports.forwardRef = forwardRef;
var _react = require("react");
/**
 * A utility function to wrap components with `React.forwardRef`.
 * It extends the type signature for better integration with custom components.
 *
 * @param component - The component to wrap, with `props` and `ref` types explicitly defined.
 * @returns A forward-ref component with extended type inference.
 */
function forwardRef(component, subcomponents) {
  const forwardedComponent = /*#__PURE__*/(0, _react.forwardRef)(component);

  // Attach subcomponents if provided
  if (subcomponents) {
    Object.assign(forwardedComponent, subcomponents);
  }
  return forwardedComponent;
}