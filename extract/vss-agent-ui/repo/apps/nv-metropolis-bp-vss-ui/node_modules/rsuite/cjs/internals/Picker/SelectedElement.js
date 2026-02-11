'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireDefault(require("react"));
var _Badge = _interopRequireDefault(require("../../Badge"));
var _utils = require("../utils");
const SelectedElement = props => {
  const {
    selectedItems,
    prefix,
    valueKey,
    labelKey,
    childrenKey = 'children',
    countable,
    cascade,
    locale,
    badgeSize
  } = props;
  const count = selectedItems.length;
  let title = '';
  if (count) {
    title = selectedItems.map(item => {
      const label = item[labelKey];
      if (typeof label === 'string' || typeof label === 'number') {
        return label;
      } else if (/*#__PURE__*/_react.default.isValidElement(label)) {
        return (0, _utils.reactToString)(label).join('');
      }
      return '';
    }).join(', ');
  }
  return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, /*#__PURE__*/_react.default.createElement("span", {
    className: prefix('value-list'),
    title: title
  }, selectedItems.map((item, index) => {
    const checkAll = cascade && (item.checkAll || item[childrenKey]);
    return /*#__PURE__*/_react.default.createElement(_react.default.Fragment, {
      key: item[valueKey]
    }, /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('value-item')
    }, item[labelKey], checkAll && locale !== null && locale !== void 0 && locale.checkAll ? ` (${locale.checkAll})` : ''), index === count - 1 ? null : /*#__PURE__*/_react.default.createElement("span", {
      className: prefix('value-separator')
    }, ","));
  })), countable ? /*#__PURE__*/_react.default.createElement(_Badge.default, {
    className: prefix('value-count'),
    title: `${count}`,
    content: count > 99 ? '99+' : count,
    size: badgeSize
  }) : null);
};
var _default = exports.default = SelectedElement;