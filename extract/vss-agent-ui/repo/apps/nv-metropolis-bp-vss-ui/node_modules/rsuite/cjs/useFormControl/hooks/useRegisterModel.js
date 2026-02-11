'use client';
"use strict";

exports.__esModule = true;
exports.useRegisterModel = useRegisterModel;
var _react = require("react");
var _FormContext = require("../../Form/FormContext");
function useRegisterModel(name, rule) {
  const {
    pushFieldRule,
    removeFieldRule
  } = (0, _FormContext.useFormContext)() || {};
  const refRule = (0, _react.useRef)(rule);
  refRule.current = rule;
  (0, _react.useEffect)(() => {
    pushFieldRule === null || pushFieldRule === void 0 || pushFieldRule(name, refRule);
    return () => {
      removeFieldRule === null || removeFieldRule === void 0 || removeFieldRule(name);
    };
  }, [name, pushFieldRule, removeFieldRule]);
}