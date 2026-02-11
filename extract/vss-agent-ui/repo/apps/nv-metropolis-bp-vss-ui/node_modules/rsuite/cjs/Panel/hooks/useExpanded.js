'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _PanelGroup = require("../../PanelGroup");
var _hooks = require("../../internals/hooks");
function useExpanded(props) {
  const {
    expanded: expandedProp,
    defaultExpanded,
    eventKey,
    collapsible: collapsibleProp
  } = props;
  const {
    accordion,
    activeKey
  } = (0, _react.useContext)(_PanelGroup.PanelGroupContext) || {};
  const [expandedState, setExpanded] = (0, _hooks.useControlled)(expandedProp, defaultExpanded || typeof activeKey !== 'undefined' && activeKey === eventKey);
  let collapsible = collapsibleProp;
  let expanded = expandedState;
  if (accordion) {
    collapsible = true;
  }
  if (collapsible) {
    if (typeof activeKey !== 'undefined' && activeKey !== eventKey) {
      expanded = false;
    }
  }
  (0, _react.useEffect)(() => {
    if (accordion && typeof activeKey !== 'undefined') {
      setExpanded(activeKey === eventKey);
    }
  }, [accordion, activeKey, eventKey, setExpanded]);
  return [expanded, setExpanded, collapsible];
}
var _default = exports.default = useExpanded;