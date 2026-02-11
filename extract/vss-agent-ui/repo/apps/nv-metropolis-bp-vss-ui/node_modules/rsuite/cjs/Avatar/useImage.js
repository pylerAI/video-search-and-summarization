'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _hooks = require("../internals/hooks");
/**
 * A hook that loads an image and returns the status of the image.
 *
 * @example
 * ```jsx
 * const { loaded } = useImage({ src:'https://example.com/image.jpg' });
 *
 * return loaded ? <img src="https://example.com/image.jpg" /> : <Placeholder />;
 * ```
 */
const useImage = props => {
  const {
    src,
    srcSet,
    sizes,
    crossOrigin,
    onError
  } = props;
  const [status, setStatus] = (0, _react.useState)('pending');
  const imgRef = (0, _react.useRef)(null);
  const flush = () => {
    if (imgRef.current) {
      imgRef.current.onload = null;
      imgRef.current.onerror = null;
      imgRef.current = null;
    }
  };
  const handleLoad = (0, _react.useCallback)(() => {
    setStatus('loaded');
    flush();
  }, []);
  const handleError = (0, _react.useCallback)(event => {
    setStatus('error');
    flush();
    onError === null || onError === void 0 || onError(event);
  }, [onError]);
  (0, _react.useEffect)(() => {
    setStatus(src ? 'loading' : 'pending');
  }, [src]);
  const loadImge = (0, _react.useCallback)(() => {
    if (!src) {
      return;
    }
    const img = new Image();
    img.onload = handleLoad;
    img.onerror = handleError;
    if (src) img.src = src;
    if (srcSet) img.srcset = srcSet;
    if (sizes) img.sizes = sizes;
    if (crossOrigin) img.crossOrigin = crossOrigin;
    imgRef.current = img;
  }, [crossOrigin, handleError, handleLoad, sizes, src, srcSet]);
  (0, _hooks.useIsomorphicLayoutEffect)(() => {
    if (status === 'loading') {
      loadImge();
    }
  }, [loadImge, status]);
  (0, _react.useEffect)(() => {
    return flush;
  }, []);
  return {
    loaded: status === 'loaded',
    status
  };
};
var _default = exports.default = useImage;