'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _ImageWrapper = require("./ImageWrapper");
var _useImage = require("./hooks/useImage");
const Image = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Image', props);
  const {
    as = 'img',
    bordered,
    classPrefix = 'image',
    className,
    circle,
    crossOrigin,
    fit,
    fallbackSrc,
    loading,
    rounded,
    srcSet,
    sizes,
    shaded,
    src,
    style,
    position,
    placeholder,
    width,
    height,
    zoomed,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    circle,
    bordered,
    rounded,
    shaded,
    zoomed
  }));
  const {
    imgSrc,
    isLoading,
    onLoad,
    onError
  } = (0, _useImage.useImage)({
    src,
    fallbackSrc
  });
  const styles = {
    ...style,
    ['--rs-object-fit']: fit,
    ['--rs-object-position']: position
  };
  const image = /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    src: imgSrc,
    className: classes,
    style: styles,
    width: width,
    height: height,
    loading: loading,
    onLoad: onLoad,
    onError: onError,
    crossOrigin: crossOrigin,
    srcSet: srcSet,
    sizes: sizes
  }, rest));
  if (zoomed) {
    return /*#__PURE__*/_react.default.createElement(_ImageWrapper.ImageWrapper, {
      w: width,
      h: height
    }, image);
  }
  if (placeholder) {
    return /*#__PURE__*/_react.default.createElement(_ImageWrapper.ImageWrapper, {
      w: width,
      h: height
    }, isLoading && placeholder, image);
  }
  return image;
});
Image.displayName = 'Image';
var _default = exports.default = Image;