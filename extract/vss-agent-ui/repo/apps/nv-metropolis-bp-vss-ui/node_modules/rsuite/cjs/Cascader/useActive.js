'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../internals/hooks");
const useActive = props => {
  const {
    onOpen,
    onClose,
    target,
    setSearchKeyword
  } = props;
  // Use component active state to support keyboard events.
  const [active, setActive] = (0, _react.useState)(false);
  const onEnter = (0, _hooks.useEventCallback)(node => {
    var _props$onEnter;
    (_props$onEnter = props.onEnter) === null || _props$onEnter === void 0 || _props$onEnter.call(props, node);
    if (!target.current) {
      return;
    }
    onOpen === null || onOpen === void 0 || onOpen();
    setActive(true);
  });
  const onExit = (0, _hooks.useEventCallback)(node => {
    var _props$onExit;
    (_props$onExit = props.onExit) === null || _props$onExit === void 0 || _props$onExit.call(props, node);
    if (!target.current) {
      return;
    }
    onClose === null || onClose === void 0 || onClose();
    setActive(false);
    setSearchKeyword('');
  });
  return {
    active,
    events: {
      onEnter,
      onExit
    }
  };
};
var _default = exports.default = useActive;