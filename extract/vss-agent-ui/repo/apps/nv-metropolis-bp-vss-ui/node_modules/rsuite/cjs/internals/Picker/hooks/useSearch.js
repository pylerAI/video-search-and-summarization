'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _isUndefined = _interopRequireDefault(require("lodash/isUndefined"));
var _utils = require("../utils");
/**
 * A hook that handles search filter options
 */
function useSearch(data, props) {
  const {
    labelKey,
    searchBy,
    callback
  } = props;

  // Use search keywords to filter options.
  const [searchKeyword, setSearchKeyword] = (0, _react.useState)('');
  const resetSearch = (0, _react.useCallback)(() => {
    setSearchKeyword('');
  }, []);

  /**
   * Index of keyword  in `label`
   * @param {node} label
   */
  const checkShouldDisplay = (0, _react.useCallback)((item, keyword) => {
    const checkValue = typeof item === 'object' ? item === null || item === void 0 ? void 0 : item[labelKey] : String(item);
    const _keyword = (0, _isUndefined.default)(keyword) ? searchKeyword : keyword;
    if (typeof searchBy === 'function') {
      return searchBy(_keyword, checkValue, item);
    }
    return (0, _utils.shouldDisplay)(checkValue, _keyword);
  }, [labelKey, searchBy, searchKeyword]);
  const filteredData = (0, _react.useMemo)(() => {
    return data.filter(item => checkShouldDisplay(item, searchKeyword));
  }, [checkShouldDisplay, data, searchKeyword]);
  const handleSearch = (searchKeyword, event) => {
    const filteredData = data.filter(item => checkShouldDisplay(item, searchKeyword));
    setSearchKeyword(searchKeyword);
    callback === null || callback === void 0 || callback(searchKeyword, filteredData, event);
  };
  return {
    searchKeyword,
    filteredData,
    checkShouldDisplay,
    handleSearch,
    resetSearch
  };
}
var _default = exports.default = useSearch;