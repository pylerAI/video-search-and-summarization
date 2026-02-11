'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _get = _interopRequireDefault(require("lodash/get"));
var _AccordionButton = _interopRequireDefault(require("./AccordionButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const PanelHeader = props => {
  const {
    as = 'div',
    classPrefix = 'panel',
    className,
    children,
    collapsible,
    caretAs,
    disabled,
    expanded,
    role,
    bodyId,
    buttonId,
    onClickButton,
    ...rest
  } = props;
  const {
    merge,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  let headerElement;
  if (! /*#__PURE__*/(0, _react.isValidElement)(children) || Array.isArray(children) || (0, _utils.isFragment)(children)) {
    headerElement = /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('title')
    }, children);
  } else {
    const className = merge(prefix('title'), (0, _get.default)(children, 'props.className'));
    headerElement = /*#__PURE__*/(0, _react.cloneElement)(children, {
      className
    });
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    className: merge(className, prefix('header'))
  }, rest), collapsible ? /*#__PURE__*/_react.default.createElement(_AccordionButton.default, {
    id: buttonId,
    role: role,
    caretAs: caretAs,
    controlId: bodyId,
    disabled: disabled,
    expanded: expanded,
    onClick: onClickButton
  }, headerElement) : headerElement);
};
var _default = exports.default = PanelHeader;