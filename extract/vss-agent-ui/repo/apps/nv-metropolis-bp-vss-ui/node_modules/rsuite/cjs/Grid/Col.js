'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _constants = require("../internals/constants");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `Col` component is used for layout and grids.
 * @see https://rsuitejs.com/en/components/grid
 */
const Col = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Col', props);
  const {
    as,
    classPrefix = 'col',
    className,
    span,
    offset,
    push,
    pull,
    order,
    hidden,
    ...rest
  } = propsWithDefaults;
  const {
    prefix,
    merge,
    rootPrefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    colClasses,
    omitKeys
  } = (0, _react.useMemo)(() => {
    const colClasses = {};
    const omitKeys = {};
    const addResponsiveClasses = (size, value, type) => {
      if (value === undefined) return;
      if (type === 'span' && value === 'auto') {
        colClasses[prefix(`auto-${size}`)] = true;
        return;
      }
      const classKey = type === 'hidden' ? rootPrefix(`hidden-${size}`) : prefix(`${size}-${type === 'span' ? '' : type + '-'}${value}`);
      colClasses[classKey] = type === 'hidden' ? Boolean(value) : Number(value) >= 0;
    };

    // Handle new responsive props format
    const resolve = (propValue, type) => {
      if (propValue === undefined) return;
      if (typeof propValue === 'object') {
        // Handle responsive object format
        _constants.BREAKPOINTS.forEach(size => {
          const value = propValue[size];
          if (value !== undefined) {
            addResponsiveClasses(size, value, type);
          }
        });
      } else {
        // Handle single value format (applies to xs)
        addResponsiveClasses('xs', propValue, type);
      }
    };

    // Process new format props
    resolve(span, 'span');
    resolve(offset, 'offset');
    resolve(push, 'push');
    resolve(pull, 'pull');
    resolve(order, 'order');
    resolve(hidden, 'hidden');

    // Handle legacy format props
    _constants.BREAKPOINTS.forEach(size => {
      const value = rest[size];
      omitKeys[size] = null;
      if (typeof value === 'number') {
        addResponsiveClasses(size, value, 'span');
      }

      // Handle legacy props
      ['Offset', 'Push', 'Pull', 'Hidden'].forEach(type => {
        const legacyKey = `${size}${type}`;
        const legacyValue = rest[legacyKey];
        omitKeys[legacyKey] = null;
        if (legacyValue !== undefined) {
          addResponsiveClasses(size, legacyValue, type.toLowerCase());
        }
      });
    });
    return {
      colClasses,
      omitKeys
    };
  }, [prefix, rootPrefix, span, offset, push, pull, order, hidden, ..._constants.BREAKPOINTS.map(size => rest[size])]);
  const classes = merge(className, withPrefix(), colClasses);
  const unhandledProps = (0, _omit.default)(rest, Object.keys(omitKeys));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, unhandledProps, {
    ref: ref,
    className: classes
  }));
});
Col.displayName = 'Col';
var _default = exports.default = Col;