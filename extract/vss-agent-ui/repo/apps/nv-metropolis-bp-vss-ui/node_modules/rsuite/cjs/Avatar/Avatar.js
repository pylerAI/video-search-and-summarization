'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _StyledBox = _interopRequireDefault(require("../internals/StyledBox"));
var _AvatarIcon = _interopRequireDefault(require("./AvatarIcon"));
var _useImage = _interopRequireDefault(require("./useImage"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _AvatarGroup = require("../AvatarGroup/AvatarGroup");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The Avatar component is used to represent user or brand.
 * @see https://rsuitejs.com/components/avatar
 */
const Avatar = (0, _utils.forwardRef)((props, ref) => {
  const {
    size: groupSize
  } = (0, _react.useContext)(_AvatarGroup.AvatarGroupContext);
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Avatar', props);
  const {
    as = 'div',
    bordered,
    alt,
    className,
    children,
    circle,
    color,
    classPrefix = 'avatar',
    size = groupSize,
    src,
    srcSet,
    sizes,
    imgProps,
    onError,
    ...rest
  } = propsWithDefaults;
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    circle,
    bordered
  }));
  const imageProps = {
    ...imgProps,
    alt,
    src,
    srcSet,
    sizes
  };
  const {
    loaded
  } = (0, _useImage.default)({
    ...imageProps,
    onError
  });
  const altComponent = (0, _react.useMemo)(() => {
    if (alt) {
      return /*#__PURE__*/_react.default.createElement("span", {
        role: "img",
        "aria-label": alt
      }, alt);
    }
    return null;
  }, [alt]);
  const placeholder = children || altComponent || /*#__PURE__*/_react.default.createElement(_AvatarIcon.default, {
    className: prefix`icon`
  });
  const image = loaded ? /*#__PURE__*/_react.default.createElement("img", (0, _extends2.default)({}, imageProps, {
    className: prefix`image`
  })) : placeholder;
  return /*#__PURE__*/_react.default.createElement(_StyledBox.default, (0, _extends2.default)({
    as: as,
    name: "avatar",
    size: size,
    color: color,
    ref: ref,
    className: classes
  }, rest), src ? image : placeholder);
});
Avatar.displayName = 'Avatar';
var _default = exports.default = Avatar;