'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
exports.useMediaQuery = useMediaQuery;
var _canUseDOM = _interopRequireDefault(require("dom-lib/canUseDOM"));
var _styledSystem = require("../internals/styled-system");
var _react = require("react");
var _breakpoints = require("./breakpoints");
// Create enhanced breakpoint system using shared breakpoint values
const breakpointSystem = (0, _breakpoints.createBreakpoints)(_styledSystem.breakpointValues);

// Create media query map that combines legacy breakpoints with enhanced conditions
const mediaQuerySizeMap = breakpointSystem.createMediaQueryMap();

/**
 * Create a MediaQueryList object or a mock for server-side rendering
 */
const matchMedia = query => {
  if (_canUseDOM.default) {
    return window.matchMedia(query);
  }
  return {
    matches: false,
    media: query
  };
};

/**
 * React hook that tracks state of a CSS media query
 * @version 5.48.0
 * @unstable Please note that this API is not stable and may change in the future.
 * @see https://rsuitejs.com/components/use-media-query
 * @param query - The media query string or array of query strings
 * @param enabled - Whether to enable the media query, defaults to true
 */
function useMediaQuery(query, enabled = true) {
  const queries = Array.isArray(query) ? query : [query];
  const mediaQueries = (0, _react.useMemo)(() => queries.map(query => mediaQuerySizeMap[query] || query), [...queries]);

  // If not enabled, we don't need to set up any media queries
  if (!enabled) {
    return queries.map(() => false);
  }
  const mediaQueryArray = (0, _react.useRef)(mediaQueries.map(query => matchMedia(query).matches));
  const subscribe = (0, _react.useCallback)(callback => {
    const list = mediaQueries.map(query => matchMedia(query));
    const handleChange = event => {
      const index = list.findIndex(item => item.media === event.media);
      if (index !== -1) {
        // The store snapshot returned by getSnapshot must be immutable. So we need to create a new array.
        const nextMediaQueryArray = mediaQueryArray.current.slice();
        nextMediaQueryArray[index] = event.matches;
        mediaQueryArray.current = nextMediaQueryArray;
      }
      callback();
    };
    list.forEach(query => {
      query.addEventListener('change', handleChange);
    });
    return () => {
      list.forEach(query => {
        query.removeEventListener('change', handleChange);
      });
    };
  }, [mediaQueries]);
  const getSnapshot = (0, _react.useCallback)(() => {
    return mediaQueryArray.current;
  }, []);
  const getServerSnapshot = (0, _react.useCallback)(() => {
    return mediaQueryArray.current;
  }, []);
  return (0, _react.useSyncExternalStore)(subscribe, getSnapshot, getServerSnapshot);
}
var _default = exports.default = useMediaQuery;