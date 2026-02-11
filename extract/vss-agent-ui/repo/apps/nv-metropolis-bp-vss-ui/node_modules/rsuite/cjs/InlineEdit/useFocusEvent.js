'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _domLib = require("dom-lib");
var _hooks = require("../internals/hooks");
var _symbols = require("../internals/symbols");
const useFocusEvent = ({
  isEditing,
  stateOnBlur,
  onSave,
  onCancel
}) => {
  var _ref$current;
  const ref = (0, _react.useRef)(null);
  const rootRef = (0, _react.useRef)(null);
  const isPicker = ((_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.type) === _symbols.RSUITE_PICKER_TYPE;
  const focus = () => {
    if (isPicker) {
      setTimeout(() => {
        var _picker$target, _picker$target$focus, _picker$open;
        const picker = ref.current;
        // Auto focus the search input
        picker === null || picker === void 0 || (_picker$target = picker.target) === null || _picker$target === void 0 || (_picker$target$focus = _picker$target.focus) === null || _picker$target$focus === void 0 || _picker$target$focus.call(_picker$target);

        // Open the picker
        picker === null || picker === void 0 || (_picker$open = picker.open) === null || _picker$open === void 0 || _picker$open.call(picker);
      }, 100);
    } else {
      var _ref$current2, _ref$current2$focus;
      (_ref$current2 = ref.current) === null || _ref$current2 === void 0 || (_ref$current2$focus = _ref$current2.focus) === null || _ref$current2$focus === void 0 || _ref$current2$focus.call(_ref$current2);
    }
  };
  const handleBlur = (0, _hooks.useEventCallback)(event => {
    if (event) {
      var _event$relatedTarget;
      const relatedTarget = (_event$relatedTarget = event.relatedTarget) !== null && _event$relatedTarget !== void 0 ? _event$relatedTarget : (0, _domLib.ownerDocument)(event.currentTarget).activeElement;
      if (rootRef.current && (0, _domLib.contains)(rootRef.current, relatedTarget)) {
        return;
      }
    }
    if (stateOnBlur === 'save') {
      onSave === null || onSave === void 0 || onSave(event);
    } else if (stateOnBlur === 'cancel') {
      onCancel === null || onCancel === void 0 || onCancel(event);
    }
  });
  (0, _hooks.useIsomorphicLayoutEffect)(() => {
    if (isEditing) {
      focus();
    }
  }, []);
  (0, _hooks.useUpdateEffect)(() => {
    if (isEditing) {
      focus();
    }
  }, [isEditing]);
  return {
    target: ref,
    root: rootRef,
    onBlur: handleBlur
  };
};
var _default = exports.default = useFocusEvent;