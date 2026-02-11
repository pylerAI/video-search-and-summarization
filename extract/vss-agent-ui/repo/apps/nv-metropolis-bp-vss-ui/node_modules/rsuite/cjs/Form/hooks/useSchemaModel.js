'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _schemaTyped = require("schema-typed");
var _react = require("react");
var _constructFlatSchema = require("../utils/constructFlatSchema");
function useSchemaModel(formModel, nestedField) {
  const subRulesRef = (0, _react.useRef)([]);
  const pushFieldRule = (0, _react.useCallback)((name, fieldRule) => {
    subRulesRef.current.push({
      name,
      fieldRule
    });
  }, []);
  const removeFieldRule = (0, _react.useCallback)(name => {
    const index = subRulesRef.current.findIndex(v => v.name === name);
    subRulesRef.current.splice(index, 1);
  }, []);
  const getCombinedModel = (0, _react.useCallback)(() => {
    const realSubRules = subRulesRef.current.filter(v => Boolean(v.fieldRule.current));

    // If there is no sub rule, return the original form model
    if (realSubRules.length === 0) {
      return formModel;
    }
    const subRuleObject = realSubRules.map(({
      name,
      fieldRule
    }) => ({
      [name]: fieldRule.current
    })).reduce((a, b) => Object.assign(a, b), {});
    return _schemaTyped.SchemaModel.combine(formModel, (0, _schemaTyped.SchemaModel)(nestedField ? (0, _constructFlatSchema.constructFlatSchema)(subRuleObject) : subRuleObject));
  }, [formModel, nestedField]);
  return {
    getCombinedModel,
    pushFieldRule,
    removeFieldRule
  };
}
var _default = exports.default = useSchemaModel;