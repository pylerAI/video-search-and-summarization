'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _InputGroupAddon = _interopRequireDefault(require("./InputGroupAddon"));
var _InputGroupButton = _interopRequireDefault(require("./InputGroupButton"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _InputGroupContext = require("./InputGroupContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Addon: _InputGroupAddon.default,
  Button: _InputGroupButton.default
};

/**
 * The `InputGroup` component is used to specify an input field with an add-on.
 * @see https://rsuitejs.com/components/input/#input-group
 */
const InputGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('InputGroup', props);
  const {
    as,
    classPrefix = 'input-group',
    className,
    disabled,
    inside,
    size = 'md',
    children,
    ...rest
  } = propsWithDefaults;
  const [focus, setFocus] = (0, _react.useState)(false);
  const handleFocus = (0, _react.useCallback)(() => {
    setFocus(true);
  }, []);
  const handleBlur = (0, _react.useCallback)(() => {
    setFocus(false);
  }, []);
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const inputGroupChildren = (0, _react.useMemo)(() => {
    return _react.default.Children.map(children, item => {
      if (/*#__PURE__*/_react.default.isValidElement(item)) {
        // Fix: Add type assertion to pass the disabled prop to the child element
        return disabled ? /*#__PURE__*/_react.default.cloneElement(item, {
          disabled
        }) : item;
      }
      return item;
    });
  }, [children, disabled]);
  const contextValue = (0, _react.useMemo)(() => ({
    size,
    onFocus: handleFocus,
    onBlur: handleBlur
  }), [size, handleFocus, handleBlur]);
  return /*#__PURE__*/_react.default.createElement(_InputGroupContext.InputGroupContext.Provider, {
    value: contextValue
  }, /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: ref,
    className: classes,
    "data-size": size,
    "data-inside": inside,
    "data-disabled": disabled,
    "data-focus": focus
  }), inputGroupChildren));
}, Subcomponents);
InputGroup.displayName = 'InputGroup';
var _default = exports.default = InputGroup;