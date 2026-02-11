'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _flatten2 = _interopRequireDefault(require("lodash/flatten"));
var _react = require("react");
const useManager = () => {
  const collectionMapRef = (0, _react.useRef)({});
  const listItemRegister = (0, _react.useCallback)(item => {
    const collection = item.info.collection;
    if (!Array.isArray(collectionMapRef.current[collection])) {
      // reset collection
      collectionMapRef.current[collection] = [];
    }
    collectionMapRef.current[collection].push(item);
    return {
      unregister: () => {
        const index = collectionMapRef.current[collection].indexOf(item);
        if (index !== -1) {
          collectionMapRef.current[collection].splice(index, 1);
        }
      }
    };
  }, []);
  const getManagedItem = (0, _react.useCallback)(node => {
    const allItems = (0, _flatten2.default)(Object.values(collectionMapRef.current));
    return allItems.find(managerRef => managerRef.node === node);
  }, []);
  const getOrderedItems = (0, _react.useCallback)(collection => {
    return collection != null ? [...collectionMapRef.current[collection]].sort((nodeInfo1, nodeInfo2) => Number(nodeInfo1.info.index) - Number(nodeInfo2.info.index)) : [];
  }, []);
  return {
    listItemRegister,
    getManagedItem,
    getOrderedItems
  };
};
var _default = exports.default = useManager;