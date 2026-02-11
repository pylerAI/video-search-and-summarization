'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.DIMENSION = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _getStyle = _interopRequireDefault(require("dom-lib/getStyle"));
var _addStyle = _interopRequireDefault(require("dom-lib/addStyle"));
var _get2 = _interopRequireDefault(require("lodash/get"));
var _capitalize = _interopRequireDefault(require("lodash/capitalize"));
var _Transition = _interopRequireDefault(require("./Transition"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
let DIMENSION = exports.DIMENSION = /*#__PURE__*/function (DIMENSION) {
  DIMENSION["HEIGHT"] = "height";
  DIMENSION["WIDTH"] = "width";
  return DIMENSION;
}({});
const triggerBrowserReflow = node => (0, _get2.default)(node, 'offsetHeight');
const MARGINS = {
  height: ['marginTop', 'marginBottom'],
  width: ['marginLeft', 'marginRight']
};
function defaultGetDimensionValue(dimension, elem) {
  var _get;
  const value = (_get = (0, _get2.default)(elem, `offset${(0, _capitalize.default)(dimension)}`)) !== null && _get !== void 0 ? _get : 0;
  const margins = MARGINS[dimension];
  return value + parseInt((0, _getStyle.default)(elem, margins[0]), 10) + parseInt((0, _getStyle.default)(elem, margins[1]), 10);
}
function getScrollDimensionValue(elem, dimension) {
  const value = (0, _get2.default)(elem, `scroll${(0, _capitalize.default)(dimension)}`);
  return `${value}px`;
}

/**
 * A Collapse animation component.
 * @see https://rsuitejs.com/components/animation/#collapse
 */
const Collapse = /*#__PURE__*/_react.default.forwardRef((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Collapse', props);
  const {
    className,
    timeout = 300,
    dimension: dimensionProp = DIMENSION.HEIGHT,
    exitedClassName,
    exitingClassName,
    enteredClassName,
    enteringClassName,
    getDimensionValue = defaultGetDimensionValue,
    onEnter,
    onEntering,
    onEntered,
    onExit,
    onExiting,
    ...rest
  } = propsWithDefaults;
  const {
    prefix,
    merge
  } = (0, _hooks.useStyles)('anim');
  const dimension = typeof dimensionProp === 'function' ? dimensionProp() : dimensionProp;
  const handleEnter = (0, _react.useCallback)(elem => {
    (0, _addStyle.default)(elem, dimension, 0);
  }, [dimension]);
  const handleEntering = (0, _react.useCallback)(elem => {
    (0, _addStyle.default)(elem, dimension, getScrollDimensionValue(elem, dimension));
  }, [dimension]);
  const handleEntered = (0, _react.useCallback)(elem => {
    (0, _addStyle.default)(elem, dimension, 'auto');
  }, [dimension]);
  const handleExit = (0, _react.useCallback)(elem => {
    const value = getDimensionValue ? getDimensionValue(dimension, elem) : 0;
    (0, _addStyle.default)(elem, dimension, `${value}px`);
  }, [dimension, getDimensionValue]);
  const handleExiting = (0, _react.useCallback)(elem => {
    triggerBrowserReflow(elem);
    (0, _addStyle.default)(elem, dimension, 0);
  }, [dimension]);
  return /*#__PURE__*/_react.default.createElement(_Transition.default, (0, _extends2.default)({}, rest, {
    ref: ref,
    timeout: timeout,
    className: merge(className, prefix({
      'collapse-horizontal': dimension === 'width'
    })),
    exitedClassName: exitedClassName || prefix('collapse'),
    exitingClassName: exitingClassName || prefix('collapsing'),
    enteredClassName: enteredClassName || prefix('collapse', 'in'),
    enteringClassName: enteringClassName || prefix('collapsing'),
    onEnter: (0, _utils.createChainedFunction)(handleEnter, onEnter),
    onEntering: (0, _utils.createChainedFunction)(handleEntering, onEntering),
    onEntered: (0, _utils.createChainedFunction)(handleEntered, onEntered),
    onExit: (0, _utils.createChainedFunction)(handleExit, onExit),
    onExiting: (0, _utils.createChainedFunction)(handleExiting, onExiting)
  }));
});
Collapse.displayName = 'Collapse';
var _default = exports.default = Collapse;