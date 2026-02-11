'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.createComponent = createComponent;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _kebabCase = _interopRequireDefault(require("lodash/kebabCase"));
var _Box = _interopRequireDefault(require("../../Box/Box"));
var _forwardRef = require("./forwardRef");
var _useStyles = require("../../hooks/useStyles");
var _useCustom = require("../../hooks/useCustom");
/**
 * Why not import like this:
 * ```
 * import { useStyles, useCustom } from '../../hooks/index.js';
 * ```
 *
 * We import useStyles and useCustom separately to prevent Vite from displaying Rollup warnings
 * during the build process. This approach avoids circular dependency issues that could affect
 * chunk division and optimizes the build output.
 */

/**
 * Create a component with `classPrefix` and `as` attributes.
 * By default, the component is based on Box component and inherits all Box props.
 */
function createComponent({
  name,
  componentAs,
  componentClassPrefix,
  ...defaultProps
}) {
  const Component = (0, _forwardRef.forwardRef)((props, ref) => {
    const {
      propsWithDefaults
    } = (0, _useCustom.useCustom)(name, props);
    const {
      as,
      classPrefix = componentClassPrefix || (0, _kebabCase.default)(name),
      className,
      role,
      ...rest
    } = propsWithDefaults;
    const {
      withPrefix,
      merge
    } = (0, _useStyles.useStyles)(classPrefix);
    const classes = merge(className, withPrefix());
    return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({}, defaultProps, rest, {
      role: role,
      ref: ref,
      className: classes,
      as: as || componentAs || 'div'
    }));
  });
  Component.displayName = name;
  return Component;
}
var _default = exports.default = createComponent;