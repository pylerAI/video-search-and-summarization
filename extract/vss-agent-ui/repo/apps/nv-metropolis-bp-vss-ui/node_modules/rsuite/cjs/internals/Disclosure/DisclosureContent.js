'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _useDisclosureContext = _interopRequireDefault(require("./useDisclosureContext"));
function DisclosureContent(props) {
  const {
    children
  } = props;
  const elementRef = (0, _react.useRef)(null);
  const disclosure = (0, _useDisclosureContext.default)(DisclosureContent.displayName);
  const [{
    open
  }] = disclosure;
  return children({
    open
  }, elementRef);
}
DisclosureContent.displayName = 'Disclosure.Content';
var _default = exports.default = DisclosureContent;