'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const DialogContainer = /*#__PURE__*/(0, _react.forwardRef)((_, ref) => {
  const [dialogs, setDialogs] = (0, _react.useState)([]);
  const [isMounted, setIsMounted] = (0, _react.useState)(false);
  const dialogsRef = (0, _react.useRef)([]);

  // Only render on the client side to avoid hydration issues
  (0, _react.useEffect)(() => {
    setIsMounted(true);
  }, []);
  (0, _react.useImperativeHandle)(ref, () => ({
    renderDialog: dialog => {
      // Always generate a unique key using guid
      const dialogKey = (0, _utils.guid)();
      const nextDialogs = [...dialogsRef.current, {
        key: dialogKey,
        dialog
      }];
      dialogsRef.current = nextDialogs;
      setDialogs(nextDialogs);
      return dialogKey;
    },
    removeDialog: key => {
      // Find if the dialog exists
      const dialogExists = dialogsRef.current.some(item => item.key === key);
      if (dialogExists) {
        // Filter out the dialog with the matching key
        const nextDialogs = dialogsRef.current.filter(item => item.key !== key);

        // Update both the ref and state
        dialogsRef.current = nextDialogs;
        setDialogs(nextDialogs);
      }
    },
    clearDialogs: () => {
      dialogsRef.current = [];
      setDialogs([]);
    }
  }));

  // Only render Portal on the client side to avoid hydration issues
  if (!isMounted) {
    return null;
  }
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, dialogs.map(item => /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
    key: item.key
  }, item.dialog)));
});
DialogContainer.displayName = 'DialogContainer';
var _default = exports.default = DialogContainer;