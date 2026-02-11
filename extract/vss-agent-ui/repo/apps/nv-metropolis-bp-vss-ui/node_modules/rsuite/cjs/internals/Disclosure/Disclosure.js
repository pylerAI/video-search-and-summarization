'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _DisclosureContext = _interopRequireWildcard(require("./DisclosureContext"));
var _DisclosureButton = _interopRequireDefault(require("./DisclosureButton"));
var _DisclosureContent = _interopRequireDefault(require("./DisclosureContent"));
var _useClickOutside = _interopRequireDefault(require("../hooks/useClickOutside"));
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Headless Disclosure
// Ref: https://w3c.github.io/aria-practices/#disclosure

const initialDisclosureState = {
  open: false
};
function disclosureReducer(state, action) {
  switch (action.type) {
    case _DisclosureContext.DisclosureActionTypes.Show:
      return {
        ...state,
        open: true
      };
    case _DisclosureContext.DisclosureActionTypes.Hide:
      return {
        ...state,
        open: false
      };
  }
  return state;
}
const Disclosure = /*#__PURE__*/_react.default.memo(props => {
  const {
    children,
    open: openProp,
    defaultOpen = false,
    hideOnClickOutside = false,
    onToggle,
    trigger = ['click']
  } = props;
  const parentDisclosure = (0, _react.useContext)(_DisclosureContext.default);
  const [{
    open: openState
  }, dispatch] = (0, _react.useReducer)(disclosureReducer, {
    ...initialDisclosureState,
    open: defaultOpen
  });
  const containerElementRef = (0, _react.useRef)(null);
  const open = openProp !== null && openProp !== void 0 ? openProp : openState;
  (0, _useClickOutside.default)({
    enabled: hideOnClickOutside,
    isOutside: event => {
      var _containerElementRef$;
      return !((_containerElementRef$ = containerElementRef.current) !== null && _containerElementRef$ !== void 0 && _containerElementRef$.contains(event.target));
    },
    handle: () => dispatch({
      type: _DisclosureContext.DisclosureActionTypes.Hide
    })
  });
  const onMouseEnter = (0, _react.useCallback)(event => {
    if (!open) {
      dispatch({
        type: _DisclosureContext.DisclosureActionTypes.Show
      });
      onToggle === null || onToggle === void 0 || onToggle(true, event);
    }
  }, [open, dispatch, onToggle]);
  const onMouseLeave = (0, _react.useCallback)(event => {
    if (open) {
      dispatch({
        type: _DisclosureContext.DisclosureActionTypes.Hide
      });
      onToggle === null || onToggle === void 0 || onToggle(false, event);
    }
  }, [open, dispatch, onToggle]);
  const contextValue = (0, _react.useMemo)(() => {
    const cascadeDispatch = action => {
      const result = dispatch(action);
      if ('cascade' in action) {
        parentDisclosure === null || parentDisclosure === void 0 || parentDisclosure[1](action);
      }
      return result;
    };
    return [{
      open
    }, cascadeDispatch, {
      onToggle,
      trigger
    }];
  }, [parentDisclosure, open, dispatch, onToggle, trigger]);
  const renderProps = (0, _react.useMemo)(() => {
    const renderProps = {
      open
    };
    if (trigger.includes('hover')) {
      renderProps.onMouseEnter = onMouseEnter;
      renderProps.onMouseLeave = onMouseLeave;
    }
    return renderProps;
  }, [open, trigger, onMouseEnter, onMouseLeave]);
  return /*#__PURE__*/_react.default.createElement(_DisclosureContext.default.Provider, {
    value: contextValue
  }, children(renderProps, containerElementRef));
});
Disclosure.displayName = 'Disclosure';
Disclosure.Button = _DisclosureButton.default;
Disclosure.Content = _DisclosureContent.default;
var _default = exports.default = Disclosure;