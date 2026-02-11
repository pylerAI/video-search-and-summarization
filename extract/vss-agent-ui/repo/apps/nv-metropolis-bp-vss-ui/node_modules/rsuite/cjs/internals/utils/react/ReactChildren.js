'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.count = count;
exports.default = void 0;
exports.find = find;
exports.forEach = forEach;
exports.map = map;
exports.mapCloneElement = mapCloneElement;
exports.rch = void 0;
var _react = _interopRequireDefault(require("react"));
var _ReactIs = require("./ReactIs");
/**
 * Flattens the given children into an array.
 * @param children - The children to flatten.
 * @returns The flattened array of children.
 */
function flatChildren(children) {
  return _react.default.Children.toArray(_react.default.Children.map(children, child => {
    if ((0, _ReactIs.isFragment)(child)) {
      var _child$props;
      return _react.default.Children.toArray(((_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.children) || []);
    }
    return child;
  }));
}

/**
 * Finds the first child that satisfies the given condition.
 * @param children - The children to search.
 * @param func - The condition function.
 * @param context - The context to use for the condition function.
 * @returns The first child that satisfies the condition, or undefined if no child is found.
 */
function find(children, func, context) {
  let index = 0;
  let result;
  _react.default.Children.forEach(flatChildren(children), child => {
    if (result) {
      return;
    }
    index += 1;
    if (func.call(context, child, index)) {
      result = child;
    }
  });
  return result;
}

/**
 * Maps over the children and applies the given function to each child.
 * @param children - The children to map over.
 * @param func - The function to apply to each child.
 * @param context - The context to use for the function.
 * @returns An array of the results of applying the function to each child.
 */
function map(children, func, context) {
  let index = 0;
  return _react.default.Children.map(flatChildren(children), child => {
    if (! /*#__PURE__*/_react.default.isValidElement(child)) {
      return child;
    }
    const handle = func.call(context, child, index);
    index += 1;
    return handle;
  });
}

/**
 * Maps over the children and clones each child element with the provided props.
 * @param children - The children to clone and map over.
 * @param func - The function to apply to each child element.
 * @param context - The context to use for the function.
 * @returns An array of the cloned and modified child elements.
 */
function mapCloneElement(children, func, context) {
  return map(children, (child, index) => /*#__PURE__*/_react.default.cloneElement(child, {
    key: index,
    ...func(child, index)
  }), context);
}

/**
 * Iterates over children that are in flat array form.
 * @param children
 * @param func
 * @param context
 */
function forEach(children, func, context) {
  let index = 0;
  _react.default.Children.forEach(flatChildren(children), child => {
    if (! /*#__PURE__*/_react.default.isValidElement(child)) {
      return;
    }
    func.call(context, child, index);
    index += 1;
  });
}

/**
 * Returns the number of children.
 * @param children - The children to count.
 * @returns The number of children.
 */
function count(children) {
  return _react.default.Children.count(flatChildren(children));
}

/**
 * Checks if any child satisfies the given condition.
 * @param children - The children to check.
 * @param func - The condition function.
 * @param context - The context to use for the condition function.
 * @returns True if any child satisfies the condition, false otherwise.
 */
function some(children, func, context) {
  let index = 0;
  let result = false;
  _react.default.Children.forEach(flatChildren(children), child => {
    if (result) {
      return;
    }
    if (! /*#__PURE__*/_react.default.isValidElement(child)) {
      return;
    }
    if (func.call(context, child, index += 1)) {
      result = true;
    }
  });
  return result;
}

/**
 * Utility functions for working with React children.
 */
const rch = exports.rch = {
  /**
   * Maps over the children and clones each child element with the provided props.
   */
  mapCloneElement,
  /**
   * Returns the number of children.
   */
  count,
  /**
   * Checks if any child satisfies the given condition.
   */
  some,
  /**
   * Maps over the children and applies the given function to each child.
   */
  map,
  /**
   * Iterates over children that are in flat array form.
   */
  forEach,
  /**
   * Finds the first child that satisfies the given condition.
   */
  find
};
var _default = exports.default = rch;