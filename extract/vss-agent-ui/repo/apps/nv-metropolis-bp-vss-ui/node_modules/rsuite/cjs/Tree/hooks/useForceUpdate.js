'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
function useForceUpdate() {
  const [, dispatch] = (0, _react.useState)(Object.create(null));
  const forceUpdate = (0, _react.useCallback)(() => {
    dispatch(Object.create(null));
  }, [dispatch]);
  return forceUpdate;
}
var _default = exports.default = useForceUpdate;