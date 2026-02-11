'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.RadioTileContext = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Stack = _interopRequireDefault(require("../Stack"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const RadioTileContext = exports.RadioTileContext = /*#__PURE__*/_react.default.createContext({});

/**
 * The `RadioTileGroup` component is used to group a collection of `RadioTile` components.
 * @version 5.35.0
 * @see https://rsuitejs.com/components/radio-tile/
 */
const RadioTileGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('RadioTileGroup', props);
  const {
    as = _Stack.default,
    className,
    inline,
    children,
    classPrefix = 'radio-tile-group',
    disabled,
    value: valueProp,
    defaultValue,
    name,
    onChange,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const handleChange = (0, _react.useCallback)((nextValue, event) => {
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
  }, [onChange, setValue]);
  const contextValue = (0, _react.useMemo)(() => ({
    name,
    disabled,
    value: typeof value === 'undefined' ? null : value,
    onChange: handleChange
  }), [disabled, handleChange, name, value]);
  return /*#__PURE__*/_react.default.createElement(RadioTileContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    alignItems: "stretch",
    spacing: 10,
    role: "radiogroup",
    direction: inline ? 'row' : 'column',
    ref: ref,
    className: classes
  }, rest), children));
});
RadioTileGroup.displayName = 'RadioTileGroup';
var _default = exports.default = RadioTileGroup;