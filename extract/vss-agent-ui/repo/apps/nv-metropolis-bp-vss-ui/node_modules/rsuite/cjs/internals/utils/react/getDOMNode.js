'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.getDOMNode = getDOMNode;
function safeFindDOMNode(componentOrElement) {
  if (componentOrElement && 'setState' in componentOrElement) {
    var _ref$current, _ref;
    // Access the underlying DOM node through ref if available
    return (_ref$current = componentOrElement === null || componentOrElement === void 0 || (_ref = componentOrElement.ref) === null || _ref === void 0 ? void 0 : _ref.current) !== null && _ref$current !== void 0 ? _ref$current : null;
  }
  return componentOrElement !== null && componentOrElement !== void 0 ? componentOrElement : null;
}
const getRefTarget = ref => {
  return ref && ('current' in ref ? ref.current : ref);
};
function getDOMNode(elementOrRef) {
  // If elementOrRef is an instance of Position, child is returned. [PositionInstance]
  const element = (elementOrRef === null || elementOrRef === void 0 ? void 0 : elementOrRef.root) || (elementOrRef === null || elementOrRef === void 0 ? void 0 : elementOrRef.child) || getRefTarget(elementOrRef);

  // Native HTML elements
  if (element !== null && element !== void 0 && element.nodeType && typeof (element === null || element === void 0 ? void 0 : element.nodeName) === 'string') {
    return element;
  }
  return safeFindDOMNode(element);
}
var _default = exports.default = getDOMNode;