'use client';
"use strict";

exports.__esModule = true;
exports.useImage = void 0;
var _react = require("react");
const useImage = props => {
  const {
    src,
    fallbackSrc
  } = props;
  const [imgSrc, setImgSrc] = (0, _react.useState)(src || fallbackSrc || null);
  const [isLoading, setIsLoading] = (0, _react.useState)(!!src);
  const [error, setError] = (0, _react.useState)(false);
  (0, _react.useEffect)(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }
    setImgSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);
  const handleLoad = () => {
    setIsLoading(false);
    setError(false);
  };
  const handleError = () => {
    setIsLoading(false);
    setError(true);
    setImgSrc(fallbackSrc || null);
  };
  return {
    imgSrc,
    isLoading,
    error,
    onLoad: handleLoad,
    onError: handleError
  };
};
exports.useImage = useImage;