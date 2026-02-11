'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../../internals/hooks");
function useFocusState(props) {
  const {
    target,
    value,
    focusActiveNode
  } = props;
  const [active, setActive] = (0, _react.useState)(false);
  const [focusItemValue, setFocusItemValue] = (0, _react.useState)(null);
  const focusTarget = (0, _hooks.useEventCallback)(() => {
    var _target$current;
    (_target$current = target.current) === null || _target$current === void 0 || _target$current.focus();
  });
  const onEnter = (0, _hooks.useEventCallback)(node => {
    var _props$onEnter;
    setActive(true);
    (_props$onEnter = props.onEnter) === null || _props$onEnter === void 0 || _props$onEnter.call(props, node);
  });
  const onExit = (0, _hooks.useEventCallback)(node => {
    var _props$onExit;
    setActive(false);
    focusTarget();
    (_props$onExit = props.onExit) === null || _props$onExit === void 0 || _props$onExit.call(props, node);
  });
  const onEntered = (0, _hooks.useEventCallback)(node => {
    var _props$onEntered;
    if (value) {
      setFocusItemValue(value);
      focusActiveNode();
    }
    (_props$onEntered = props.onEntered) === null || _props$onEntered === void 0 || _props$onEntered.call(props, node);
  });
  return {
    active,
    focusItemValue,
    setFocusItemValue,
    triggerProps: {
      onEnter,
      onExit,
      onEntered
    }
  };
}
var _default = exports.default = useFocusState;