'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.constructFlatSchema = constructFlatSchema;
var _schemaTyped = require("schema-typed");
var _set = _interopRequireDefault(require("lodash/set"));
/**
 * combine flat schema to nested schema
 */
function constructFlatSchema(schema) {
  const shape = {};
  Object.keys(schema).forEach(key => {
    (0, _set.default)(shape, key, {
      schema: schema[key],
      primitiveType: true
    });
  });
  function convertShapeToSchema(shape, result, internal) {
    Object.keys(shape).forEach(key => {
      const currentShape = shape[key];
      if (Array.isArray(currentShape)) {
        result[key] = (0, _schemaTyped.ArrayType)().of(...currentShape.map(v => {
          if (v.primitiveType) {
            return v.schema;
          }
          return convertShapeToSchema(v, {}, true);
        }));
      } else {
        if (currentShape.primitiveType) {
          result[key] = currentShape.schema;
        } else {
          result[key] = convertShapeToSchema(currentShape, {}, true);
        }
      }
    });
    return internal ? (0, _schemaTyped.ObjectType)().shape(result) : result;
  }
  return convertShapeToSchema(shape, {});
}