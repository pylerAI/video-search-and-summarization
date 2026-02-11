'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.useBodyStyles = void 0;
var _getHeight = _interopRequireDefault(require("dom-lib/getHeight"));
var _on = _interopRequireDefault(require("dom-lib/on"));
var _react = require("react");
var _resizeObserver = require("@juggle/resize-observer");
const useBodyStyles = (ref, options) => {
  const [bodyStyles, setBodyStyles] = (0, _react.useState)({});
  const {
    overflow,
    prefix,
    size
  } = options;
  const windowResizeListener = (0, _react.useRef)(null);
  const contentElement = (0, _react.useRef)(null);
  const contentElementResizeObserver = (0, _react.useRef)(null);
  const updateBodyStyles = (0, _react.useCallback)((_event, entering) => {
    const dialog = ref.current;
    const styles = {
      overflow: 'auto'
    };
    if (dialog) {
      // default margin
      let headerHeight = 46;
      let footerHeight = 46;
      const headerDOM = dialog.querySelector(`.${prefix('header')}`);
      const footerDOM = dialog.querySelector(`.${prefix('footer')}`);
      headerHeight = headerDOM ? (0, _getHeight.default)(headerDOM) + headerHeight : headerHeight;
      footerHeight = footerDOM ? (0, _getHeight.default)(footerDOM) + footerHeight : footerHeight;

      // Get the actual margin from the modal element itself (.rs-modal)
      const computedStyle = window.getComputedStyle(dialog);
      const marginTop = parseFloat(computedStyle.marginTop) || 0;
      const marginBottom = parseFloat(computedStyle.marginBottom) || 0;
      const dialogMargin = marginTop + marginBottom;

      // Get padding from the wrapper if needed
      const wrapper = dialog.parentElement;
      let wrapperPadding = 0;
      if (wrapper) {
        const wrapperStyle = window.getComputedStyle(wrapper);
        const paddingTop = parseFloat(wrapperStyle.paddingTop) || 0;
        const paddingBottom = parseFloat(wrapperStyle.paddingBottom) || 0;
        wrapperPadding = paddingTop + paddingBottom;
      }

      // Add extra space during entering animation (10px buffer)
      const extraSpace = entering ? 10 : 0;

      /**
       * Header height + Footer height + Dialog margin + Wrapper padding + Extra space
       */
      const excludeHeight = headerHeight + footerHeight + dialogMargin + wrapperPadding + extraSpace;
      const bodyHeight = (0, _getHeight.default)(window) - excludeHeight;

      // Always set maxHeight to available space, let browser handle content that's smaller
      styles.maxHeight = bodyHeight;
    }
    setBodyStyles(styles);
  }, [prefix, ref]);
  const onDestroyEvents = (0, _react.useCallback)(() => {
    var _windowResizeListener, _windowResizeListener2, _contentElementResize;
    (_windowResizeListener = windowResizeListener.current) === null || _windowResizeListener === void 0 || (_windowResizeListener2 = _windowResizeListener.off) === null || _windowResizeListener2 === void 0 || _windowResizeListener2.call(_windowResizeListener);
    (_contentElementResize = contentElementResizeObserver.current) === null || _contentElementResize === void 0 || _contentElementResize.disconnect();
    windowResizeListener.current = null;
    contentElementResizeObserver.current = null;
  }, []);
  const onChangeBodyStyles = (0, _react.useCallback)(entering => {
    if (!overflow || size === 'full') {
      setBodyStyles(null);
      return;
    }
    if (ref.current) {
      updateBodyStyles(undefined, entering);
      contentElement.current = ref.current.querySelector(`.${prefix('content')}`);
      if (!windowResizeListener.current) {
        windowResizeListener.current = (0, _on.default)(window, 'resize', updateBodyStyles);
      }
      if (contentElement.current && !contentElementResizeObserver.current) {
        contentElementResizeObserver.current = new _resizeObserver.ResizeObserver(() => updateBodyStyles());
        contentElementResizeObserver.current.observe(contentElement.current);
      }
    }
  }, [overflow, prefix, ref, size, updateBodyStyles]);
  (0, _react.useEffect)(() => {
    return onDestroyEvents;
  }, []);
  return [overflow ? bodyStyles : null, onChangeBodyStyles, onDestroyEvents];
};
exports.useBodyStyles = useBodyStyles;