'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _utils = require("../../internals/utils");
function useData(props) {
  const {
    controlledData = [],
    cacheData = [],
    onChange
  } = props;
  const [uncontrolledData, setData] = (0, _react.useState)(controlledData);
  const [newData, setNewData] = (0, _react.useState)([]);
  const data = (0, _react.useMemo)(() => {
    return [].concat(uncontrolledData, newData);
  }, [newData, uncontrolledData]);
  const dataWithCache = (0, _react.useMemo)(() => {
    return [].concat(data, cacheData);
  }, [data, cacheData]);

  // Update the state when the data in props changes
  (0, _react.useEffect)(() => {
    if (controlledData && !(0, _utils.shallowEqual)(controlledData, uncontrolledData)) {
      setData(controlledData);
      setNewData([]);
      onChange === null || onChange === void 0 || onChange(controlledData);
    }
  }, [controlledData, uncontrolledData, onChange]);
  return {
    data,
    dataWithCache,
    newData,
    setNewData
  };
}
var _default = exports.default = useData;