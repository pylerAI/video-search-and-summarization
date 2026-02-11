'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _schemaTyped = require("schema-typed");
exports.Model = _schemaTyped.SchemaModel;
exports.StringType = _schemaTyped.StringType;
exports.NumberType = _schemaTyped.NumberType;
exports.ArrayType = _schemaTyped.ArrayType;
exports.DateType = _schemaTyped.DateType;
exports.ObjectType = _schemaTyped.ObjectType;
exports.BooleanType = _schemaTyped.BooleanType;
exports.MixedType = _schemaTyped.MixedType;
/**
 * SchemaTyped is a wrapper of schema-typed library to provide a more friendly API.
 * It is used to validate the data of the model.
 *
 * @see https://github.com/rsuite/schema-typed#schema-typed
 */
const SchemaTyped = {
  Model: _schemaTyped.SchemaModel,
  Types: {
    StringType: _schemaTyped.StringType,
    NumberType: _schemaTyped.NumberType,
    ArrayType: _schemaTyped.ArrayType,
    DateType: _schemaTyped.DateType,
    ObjectType: _schemaTyped.ObjectType,
    BooleanType: _schemaTyped.BooleanType,
    MixedType: _schemaTyped.MixedType
  }
};
var _default = exports.default = SchemaTyped;