'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _createTextMaskInputElement = _interopRequireDefault(require("./createTextMaskInputElement"));
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * https://github.com/text-mask/text-mask/blob/master/componentDocumentation.md#guide
 */

const defaultRender = (ref, props) => /*#__PURE__*/_react.default.createElement("input", (0, _extends2.default)({
  ref: ref
}, props));

/**
 * The `TextMask` component is used to format the user input data.
 * @see https://rsuitejs.com/components/input/#masked-input
 */
const TextMask = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    mask,
    guide = true,
    placeholderChar,
    value,
    showMask,
    pipe,
    render = defaultRender,
    onChange,
    ...rest
  } = props;
  const inputRef = (0, _react.useRef)(null);
  const textMaskInputElement = (0, _react.useRef)(null);
  const initTextMask = (0, _react.useCallback)(() => {
    var _textMaskInputElement;
    textMaskInputElement.current = (0, _createTextMaskInputElement.default)({
      inputElement: inputRef.current,
      ...props
    });
    (_textMaskInputElement = textMaskInputElement.current) === null || _textMaskInputElement === void 0 || _textMaskInputElement.update(value);
  }, [props, value]);
  const handleChange = (0, _react.useCallback)(event => {
    var _textMaskInputElement2;
    (_textMaskInputElement2 = textMaskInputElement.current) === null || _textMaskInputElement2 === void 0 || _textMaskInputElement2.update();
    onChange === null || onChange === void 0 || onChange(event);
  }, [onChange]);
  (0, _react.useEffect)(() => {
    initTextMask();
  }, [guide, placeholderChar, showMask, pipe, mask, value, initTextMask]);
  return render((0, _utils.mergeRefs)(inputRef, ref), {
    onChange: handleChange,
    defaultValue: value,
    ...(0, _omit.default)(rest, ['keepCharPositions'])
  });
});
TextMask.displayName = 'TextMask';
var _default = exports.default = TextMask;