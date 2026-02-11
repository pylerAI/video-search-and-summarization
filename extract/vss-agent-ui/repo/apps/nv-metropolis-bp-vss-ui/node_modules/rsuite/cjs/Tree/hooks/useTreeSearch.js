'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = useTreeSearch;
var _react = require("react");
var _isArray = _interopRequireDefault(require("lodash/isArray"));
var _Picker = require("../../internals/Picker");
var _TreeProvider = require("../../internals/Tree/TreeProvider");
/**
 * Custom hook for searching and filtering data in a tree structure.
 */
function useTreeSearch(props) {
  const {
    labelKey,
    childrenKey
  } = (0, _TreeProvider.useItemDataKeys)();
  const {
    searchKeyword,
    data,
    searchBy,
    callback
  } = props;
  const filterVisibleData = (0, _react.useCallback)((data, searchKeyword) => {
    const setVisible = nodes => nodes.forEach(item => {
      item.visible = searchBy ? searchBy(searchKeyword, item[labelKey], item) : (0, _Picker.shouldDisplay)(item[labelKey], searchKeyword);
      if ((0, _isArray.default)(item[childrenKey])) {
        filterVisibleData(item[childrenKey], searchKeyword);
        item[childrenKey].forEach(child => {
          if (child.visible) {
            item.visible = child.visible;
          }
        });
      }
    });
    setVisible(data);
    return data;
  }, [childrenKey, labelKey, searchBy]);

  // Use search keywords to filter options.
  const [keyword, setSearchKeyword] = (0, _react.useState)(searchKeyword !== null && searchKeyword !== void 0 ? searchKeyword : '');
  const [filteredData, setFilteredData] = (0, _react.useState)(() => filterVisibleData(data, keyword));
  const handleSearch = (searchKeyword, event) => {
    const filteredData = filterVisibleData(data, searchKeyword);
    setFilteredData(filteredData);
    setSearchKeyword(searchKeyword);
    if (event) {
      callback === null || callback === void 0 || callback(searchKeyword, filteredData, event);
    }
  };
  (0, _react.useEffect)(() => {
    handleSearch(searchKeyword !== null && searchKeyword !== void 0 ? searchKeyword : '');
  }, [searchKeyword]);
  (0, _react.useEffect)(() => {
    setSearchKeyword(searchKeyword !== null && searchKeyword !== void 0 ? searchKeyword : '');
  }, [searchKeyword, setSearchKeyword]);
  const setVisibleData = (0, _react.useCallback)((data, searchKeyword) => {
    setFilteredData(filterVisibleData(data, searchKeyword));
  }, [filterVisibleData]);
  return {
    keyword,
    filteredData,
    setFilteredData: setVisibleData,
    setSearchKeyword,
    handleSearch
  };
}