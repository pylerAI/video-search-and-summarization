'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _InputBase = _interopRequireDefault(require("../internals/InputBase"));
var _utils = require("../internals/utils");
var _InputGroup = require("../InputGroup");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `<Input>` component is used to get user input in a text field.
 *
 * @see https://rsuitejs.com/components/input
 */
const Input = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Input', props);
  const inputGroup = (0, _react.useContext)(_InputGroup.InputGroupContext);
  const {
    type = 'text',
    htmlSize,
    size = (inputGroup === null || inputGroup === void 0 ? void 0 : inputGroup.size) || 'md',
    classPrefix = 'input',
    ...rest
  } = propsWithDefaults;
  return /*#__PURE__*/_react.default.createElement(_InputBase.default, (0, _extends2.default)({
    as: "input",
    ref: ref,
    classPrefix: classPrefix,
    size: size,
    type: type,
    inputProps: {
      size: htmlSize
    }
  }, rest));
});
Input.displayName = 'Input';
var _default = exports.default = Input;