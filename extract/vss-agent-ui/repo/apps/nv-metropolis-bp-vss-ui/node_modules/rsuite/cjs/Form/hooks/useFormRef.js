'use client';
"use strict";

exports.__esModule = true;
exports.default = useFormRef;
var _react = require("react");
function useFormRef(ref, props) {
  const rootRef = (0, _react.useRef)(null);
  const {
    imperativeMethods
  } = props;
  (0, _react.useImperativeHandle)(ref, () => {
    return {
      root: rootRef.current,
      ...imperativeMethods
    };
  });
  return rootRef;
}