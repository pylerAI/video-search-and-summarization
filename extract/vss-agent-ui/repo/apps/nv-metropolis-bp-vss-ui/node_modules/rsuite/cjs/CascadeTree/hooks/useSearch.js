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
    childrenKey,
    parentMap,
    flattenedData,
    parentSelectable,
    onSearch
  } = props;
  const someKeyword = (item, keyword) => {
    if (item[labelKey].match(new RegExp((0, _utils.getSafeRegExpString)(keyword || searchKeyword), 'i'))) {
      return true;
    }
    const parent = parentMap.get(item);
    if (parent && someKeyword(parent)) {
      return true;
    }
    return false;
  };
  const getSearchResult = keyword => {
    const items = [];
    const result = flattenedData.filter(item => {
      if (!parentSelectable && item[childrenKey]) {
        return false;
      }
      return someKeyword(item, keyword);
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
    const items = getSearchResult(value);
    setSearchKeyword(value);
    onSearch === null || onSearch === void 0 || onSearch(value, items, event);
  });
  return {
    searchKeyword,
    setSearchKeyword,
    items: getSearchResult(),
    handleSearch
  };
}
var _default = exports.default = useSearch;