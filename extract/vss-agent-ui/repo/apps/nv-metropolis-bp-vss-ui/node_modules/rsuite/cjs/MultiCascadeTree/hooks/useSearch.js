'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../../internals/hooks");
var _utils = require("../../internals/utils");
function useSearch(props) {
  const [searchKeyword, setSearchKeyword] = (0, _react.useState)('');
  const {
    labelKey,
    valueKey,
    flattenedData,
    uncheckableItemValues,
    onSearch
  } = props;
  const getSearchResult = () => {
    const items = [];
    const result = flattenedData.filter(item => {
      if (uncheckableItemValues !== null && uncheckableItemValues !== void 0 && uncheckableItemValues.some(value => item[valueKey] === value)) {
        return false;
      }
      if (item[labelKey].match(new RegExp((0, _utils.getSafeRegExpString)(searchKeyword), 'i'))) {
        return true;
      }
      return false;
    });
    for (let i = 0; i < result.length; i++) {
      items.push(result[i]);

      // A maximum of 100 search results are returned.
      if (i === 99) {
        return items;
      }
    }
    return items;
  };
  const handleSearch = (0, _hooks.useEventCallback)((value, event) => {
    setSearchKeyword(value);
    onSearch === null || onSearch === void 0 || onSearch(value, event);
  });
  return {
    searchKeyword,
    setSearchKeyword,
    items: getSearchResult(),
    handleSearch
  };
}
var _default = exports.default = useSearch;