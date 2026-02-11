'use client';
"use strict";

exports.__esModule = true;
exports.useRatingStates = void 0;
var _react = require("react");
var _utils = require("./utils");
/**
 * Custom hook to manage rating star states for Rate component
 */
const useRatingStates = ({
  value,
  max,
  allowHalf,
  valueProp
}) => {
  // Create a function to generate star states based on value
  const getStarStates = (0, _react.useCallback)(v => {
    return (0, _utils.transformValueToStarStatus)(typeof v !== 'undefined' ? v : value, max, allowHalf);
  }, [allowHalf, max, value]);

  // Initialize star states
  const [starStates, setStarStates] = (0, _react.useState)(getStarStates());

  // Calculate hover value from star states
  const hoverValue = (0, _utils.transformStarStatusToValue)(starStates);

  // Function to reset star states to current value
  const resetStarStates = (0, _react.useCallback)(() => {
    setStarStates(getStarStates());
  }, [getStarStates]);

  // Update star states when value prop changes
  (0, _react.useEffect)(() => {
    if (typeof valueProp !== 'undefined') {
      setStarStates(getStarStates(valueProp));
    }
  }, [valueProp, getStarStates]);
  return {
    starStates,
    setStarStates,
    resetStarStates,
    hoverValue,
    getStarStates
  };
};
exports.useRatingStates = useRatingStates;