'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _PanelGroup = _interopRequireDefault(require("../PanelGroup"));
var _AccordionPanel = _interopRequireDefault(require("./AccordionPanel"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const Subcomponents = {
  Panel: _AccordionPanel.default
};

/**
 * The `Accordion` component is used to display content that can be collapsed.
 * @see https://rsuitejs.com/components/accordion
 */
const Accordion = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Accordion', props);
  return /*#__PURE__*/_react.default.createElement(_PanelGroup.default, (0, _extends2.default)({
    accordion: true,
    ref: ref
  }, propsWithDefaults));
}, Subcomponents);
Accordion.displayName = 'Accordion';
var _default = exports.default = Accordion;