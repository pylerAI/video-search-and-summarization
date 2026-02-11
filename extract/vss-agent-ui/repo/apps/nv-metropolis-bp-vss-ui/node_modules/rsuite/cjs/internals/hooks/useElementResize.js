'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useElementResize = useElementResize;
var _react = require("react");
var _resizeObserver = require("@juggle/resize-observer");
/**
 * Attach the event handler directly to the specified DOM element,
 * and it will be triggered when the size of the DOM element is changed.
 *
 * @param eventTarget The target to listen for events on
 * @param listener An event handler
 */
function useElementResize(eventTarget, listener) {
  const resizeObserver = (0, _react.useRef)(null);
  const currentElement = (0, _react.useRef)(null);

  // Create the observer
  (0, _react.useEffect)(() => {
    // Get the target element
    let target = null;
    if (eventTarget) {
      if (typeof eventTarget === 'function') {
        target = eventTarget();
      } else if ('current' in eventTarget) {
        target = eventTarget.current;
      } else {
        target = eventTarget;
      }
    }

    // If target changed, disconnect the previous observer
    if (currentElement.current !== target) {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
        resizeObserver.current = null;
      }
      currentElement.current = target;
    }

    // If we have a target and no observer, create one
    if (target && !resizeObserver.current) {
      const observer = new _resizeObserver.ResizeObserver(listener);
      observer.observe(target);
      resizeObserver.current = observer;
    }

    // Cleanup function
    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
        resizeObserver.current = null;
      }
      currentElement.current = null;
    };
  }, [eventTarget, listener]);

  // Update the current element reference if it changes
  (0, _react.useEffect)(() => {
    if (eventTarget) {
      if (typeof eventTarget === 'function') {
        currentElement.current = eventTarget();
      } else if ('current' in eventTarget) {
        currentElement.current = eventTarget.current;
      } else {
        currentElement.current = eventTarget;
      }
    } else {
      currentElement.current = null;
    }
  }, [eventTarget]);
}
var _default = exports.default = useElementResize;