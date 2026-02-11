'use client';
"use strict";

exports.__esModule = true;
exports.useScrollState = useScrollState;
var _react = require("react");
var _hooks = require("../../hooks");
function getScrollState(target) {
  const scrollTop = target.scrollTop;
  const scrollHeight = target.scrollHeight;
  const clientHeight = target.clientHeight;
  if (scrollHeight <= clientHeight) {
    return null;
  } else if (scrollTop === 0) {
    return 'top';
  } else if (scrollTop + clientHeight === scrollHeight) {
    return 'bottom';
  } else {
    return 'middle';
  }
}
function useScrollState(scrollShadow) {
  const bodyRef = (0, _react.useRef)(null);
  const [scrollState, setScrollState] = (0, _react.useState)(null);
  (0, _hooks.useMount)(() => {
    let observer;
    if (bodyRef.current && scrollShadow) {
      const target = bodyRef.current;
      setScrollState(getScrollState(target));
      let lastScrollHeight = target.scrollHeight;

      // Listen for changes in scrollHeight
      observer = new MutationObserver(() => {
        const newScrollHeight = target === null || target === void 0 ? void 0 : target.scrollHeight;
        if (newScrollHeight && newScrollHeight !== lastScrollHeight) {
          setScrollState(getScrollState(target));
          lastScrollHeight = newScrollHeight;
        }
      });
      observer.observe(target, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
    return () => {
      var _observer;
      (_observer = observer) === null || _observer === void 0 || _observer.disconnect();
    };
  });
  const handleScroll = (0, _hooks.useEventCallback)(event => {
    const target = event.currentTarget;
    setScrollState(getScrollState(target));
  });
  return {
    scrollState,
    handleScroll: scrollShadow ? handleScroll : undefined,
    bodyRef
  };
}