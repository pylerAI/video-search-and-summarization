'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _DisclosureContext = require("./DisclosureContext");
var _constants = require("../constants");
var _useDisclosureContext = _interopRequireDefault(require("./useDisclosureContext"));
function DisclosureButton(props) {
  const {
    children
  } = props;
  const buttonRef = (0, _react.useRef)(null);
  const [{
    open
  }, dispatch, {
    onToggle
  }] = (0, _useDisclosureContext.default)(DisclosureButton.displayName);
  const toggle = (0, _react.useCallback)(event => {
    if (!open) {
      dispatch({
        type: _DisclosureContext.DisclosureActionTypes.Show
      });
      onToggle === null || onToggle === void 0 || onToggle(true, event);
    } else {
      dispatch({
        type: _DisclosureContext.DisclosureActionTypes.Hide
      });
      onToggle === null || onToggle === void 0 || onToggle(false, event);
    }
  }, [open, dispatch, onToggle]);
  const onClick = (0, _react.useCallback)(event => {
    toggle(event);
  }, [toggle]);
  const onKeyDown = (0, _react.useCallback)(event => {
    switch (event.key) {
      case _constants.KEY_VALUES.ENTER:
      case _constants.KEY_VALUES.SPACE:
        event.preventDefault();
        event.stopPropagation();
        toggle(event);
        break;
    }
  }, [toggle]);
  return children({
    role: 'button',
    'aria-expanded': open,
    onClick,
    onKeyDown,
    open
  }, buttonRef);
}
DisclosureButton.displayName = 'Disclosure.Button';
var _default = exports.default = DisclosureButton;