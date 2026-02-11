'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useBreakpointValue = useBreakpointValue;
var _useMediaQuery = _interopRequireDefault(require("../useMediaQuery"));
/**
 * A React Hook that returns different values based on different screen sizes in responsive design.
 * @version 5.64.0
 * @unstable Please note that this API is not stable and may change in the future.
 * @see https://rsuitejs.com/components/use-breakpoint-value
 *
 * @example
 * ```ts
 * const fontSize = useBreakpointValue({ sm: "14px", lg: "24px" }, { defaultValue: "16px" });
 * const direction = useBreakpointValue({ sm: 'row' }, { defaultValue:'column' });
 * ```
 *
 */
function useBreakpointValue(breakpoints, options) {
  const {
    defaultValue,
    enabled = true
  } = options || {};
  const keys = Object.keys(breakpoints);
  const values = Object.values(breakpoints);
  const matches = (0, _useMediaQuery.default)(keys, enabled);

  // Use lastIndexOf instead of indexOf to return the value of the last matching breakpoint
  // Due to how media queries work, multiple breakpoints may match simultaneously on larger screens
  // Using lastIndexOf ensures we return the value for the largest matching breakpoint
  const index = matches.lastIndexOf(true);
  return index !== -1 ? values[index] : defaultValue;
}
var _default = exports.default = useBreakpointValue;