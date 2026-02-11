'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useStyled = useStyled;
var _isEmpty = _interopRequireDefault(require("lodash/isEmpty"));
var _react = require("react");
var _hooks = require("../hooks");
var _utils = require("../utils");
var _CustomContext = require("../Provider/CustomContext");
var _responsive = require("./responsive");
var _cssAlias = require("./css-alias");
var _styleManager = require("./style-manager");
/**
 * Result of the useStyled hook
 */

/**
 * Custom hook for managing component styling with scoped CSS variables
 *
 * This hook handles:
 * 1. Generating a unique class name for the component
 * 2. Creating a scoped style rule to prevent CSS variable inheritance
 * 3. Managing the lifecycle of style rules
 * 4. Handling responsive values for different breakpoints
 *
 * @param options - Styling options
 * @returns Styling properties to apply to the component
 */
function useStyled(options) {
  const {
    cssVars = {},
    className,
    style,
    enabled = true,
    prefix = 'box'
  } = options;

  // CSS Variable Prefix, e.g. --rs-box-
  const cssVarPrefix = `--rs-${prefix}-`;
  const {
    csp
  } = (0, _react.useContext)(_CustomContext.CustomContext);

  // Generate a unique ID for this component instance
  const uniqueId = (0, _react.useId)().replace(/:/g, '');
  const componentId = `rs-${prefix}-${uniqueId}`;

  // Only apply styling if enabled and there are CSS variables
  const shouldApplyStyles = enabled && !(0, _isEmpty.default)(cssVars);

  // Apply CSS variables through StyleManager
  (0, _hooks.useIsomorphicLayoutEffect)(() => {
    if (!shouldApplyStyles) return;

    // Create base CSS rules for the variables
    let baseVarRules = '';
    let basePropRules = '';

    // Track responsive variables to handle separately
    const responsiveVars = {};

    // Process CSS variables, separating responsive from non-responsive
    Object.entries(cssVars).forEach(([key, value]) => {
      if (value !== undefined) {
        if ((0, _responsive.isResponsiveValue)(value)) {
          // Store responsive values for later processing
          responsiveVars[key] = value;

          // Add xs (mobile first) values to base styles if present
          const xsValue = value.xs;
          if (xsValue !== undefined) {
            baseVarRules += `${key}: ${xsValue}; `;
          }
        } else {
          // Add non-responsive values directly
          baseVarRules += `${key}: ${value}; `;
        }
      }
    });

    // Add actual style rules based on CSS variables
    Object.keys(cssVars).forEach(varName => {
      // Skip responsive values that don't have xs values
      if (responsiveVars[varName] && !responsiveVars[varName].xs) return;

      // Extract property name from variable name (remove prefix)
      const propName = varName.startsWith(cssVarPrefix) ? varName.substring(cssVarPrefix.length) : varName;

      // Check if the property has a corresponding CSS property mapping
      const cssProperty = _cssAlias.cssSystemPropAlias[propName];
      if (cssProperty) {
        basePropRules += `${cssProperty.property}: var(${varName}); `;
      } else if ((0, _utils.isCSSProperty)(propName)) {
        basePropRules += `${propName}: var(${varName}); `;
      }
    });

    // Combine variable definitions and property assignments
    const baseCssRules = baseVarRules + basePropRules;

    // Add the base rule to the style manager
    _styleManager.StyleManager.addRule(`.${componentId}`, baseCssRules, {
      nonce: csp === null || csp === void 0 ? void 0 : csp.nonce
    });

    // Process responsive variables
    if (!(0, _isEmpty.default)(responsiveVars)) {
      // Create media queries for each breakpoint
      const breakpointVarRules = {
        xs: '',
        // xs rules will be merged into base styles
        sm: '',
        md: '',
        lg: '',
        xl: '',
        xxl: '',
        '2xl': ''
      };
      const breakpointPropRules = {
        xs: '',
        sm: '',
        md: '',
        lg: '',
        xl: '',
        xxl: '',
        '2xl': ''
      };

      // Group styles by breakpoint
      Object.entries(responsiveVars).forEach(([varName, responsiveValue]) => {
        Object.entries(responsiveValue).forEach(([breakpoint, value]) => {
          const bp = breakpoint;
          if (value !== undefined && bp !== 'xs') {
            // Add the CSS variable definition for this breakpoint
            breakpointVarRules[bp] += `${varName}: ${value}; `;

            // Extract property name from variable name (remove prefix)
            const propName = varName.startsWith(cssVarPrefix) ? varName.substring(cssVarPrefix.length) : varName;

            // Check if the property has a corresponding CSS property mapping
            const cssProperty = _cssAlias.cssSystemPropAlias[propName];
            if (cssProperty) {
              breakpointPropRules[bp] += `${cssProperty}: var(${varName}); `;
            } else if ((0, _utils.isCSSProperty)(propName)) {
              breakpointPropRules[bp] += `${propName}: var(${varName}); `;
            }
          }
        });
      });

      // Combine variable definitions and property assignments for each breakpoint
      const breakpointRules = {
        xs: '',
        sm: breakpointVarRules.sm + breakpointPropRules.sm,
        md: breakpointVarRules.md + breakpointPropRules.md,
        lg: breakpointVarRules.lg + breakpointPropRules.lg,
        xl: breakpointVarRules.xl + breakpointPropRules.xl,
        xxl: breakpointVarRules.xxl + breakpointPropRules.xxl,
        '2xl': breakpointVarRules['2xl'] + breakpointPropRules['2xl']
      };

      // Add media queries for each breakpoint with rules (skip xs)
      Object.entries(breakpointRules).forEach(([breakpoint, rules]) => {
        if (rules && breakpoint !== 'xs') {
          const bp = breakpoint;
          const minWidth = _responsive.breakpointValues[bp];
          _styleManager.StyleManager.addRule(`@media (min-width: ${minWidth}px)`, `.${componentId} { ${rules} }`, {
            nonce: csp === null || csp === void 0 ? void 0 : csp.nonce
          });
        }
      });
    }
    return () => {
      // Clean up rules when component unmounts
      _styleManager.StyleManager.removeRule(`.${componentId}`);

      // Clean up media query rules
      Object.keys(_responsive.breakpointValues).forEach(breakpoint => {
        const bp = breakpoint;
        const minWidth = _responsive.breakpointValues[bp];
        _styleManager.StyleManager.removeRule(`@media (min-width: ${minWidth}px)`);
      });
    };
  }, [componentId, cssVars, shouldApplyStyles]);

  // Combine class names
  const combinedClassName = shouldApplyStyles ? `${className || ''} ${componentId}`.trim() : className;
  return {
    className: combinedClassName || undefined,
    style,
    id: componentId
  };
}
var _default = exports.default = useStyled;