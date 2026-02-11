'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _ProgressInfo = _interopRequireDefault(require("../Progress/ProgressInfo"));
var _ProgressCircleSections = _interopRequireDefault(require("./ProgressCircleSections"));
var _useProgressCirclePath = _interopRequireDefault(require("./hooks/useProgressCirclePath"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Display circular progress for an operation.
 * @see https://rsuitejs.com/components/progress-circle
 */
const ProgressCircle = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('ProgressCircle', props);
  const {
    as,
    classPrefix = 'progress-circle',
    className,
    gapDegree = 0,
    gapPosition = 'top',
    percent = 0,
    renderInfo,
    showInfo = true,
    status,
    strokeColor,
    strokeLinecap = 'round',
    strokeWidth = 6,
    style,
    trailColor,
    trailWidth = strokeWidth,
    width,
    sections,
    ...rest
  } = propsWithDefaults;

  // Calculate total percent from sections if provided
  const totalPercent = (0, _react.useMemo)(() => {
    if (!sections) return percent;
    return Math.min(100, sections.reduce((acc, section) => acc + section.percent, 0));
  }, [percent, sections]);
  const {
    pathString,
    trailPathStyle,
    strokePathStyle
  } = (0, _useProgressCirclePath.default)({
    gapDegree,
    gapPosition,
    totalPercent,
    strokeColor,
    strokeWidth,
    trailColor
  });
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    [`${status || ''}`]: !!status
  }));
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "progressbar",
    "aria-valuemin": "0",
    "aria-valuemax": "100",
    "aria-valuenow": totalPercent,
    ref: ref,
    className: classes,
    style: style
  }, rest), showInfo && /*#__PURE__*/_react.default.createElement(_ProgressInfo.default, {
    percent: totalPercent,
    renderInfo: renderInfo,
    status: status,
    classPrefix: classPrefix
  }), /*#__PURE__*/_react.default.createElement("svg", {
    className: prefix('svg'),
    viewBox: "0 0 100 100",
    width: width
  }, /*#__PURE__*/_react.default.createElement("path", {
    className: prefix('trail'),
    d: pathString,
    strokeWidth: trailWidth || strokeWidth,
    fillOpacity: "0",
    style: trailPathStyle
  }), sections ? /*#__PURE__*/_react.default.createElement(_ProgressCircleSections.default, {
    classPrefix: classPrefix,
    sections: sections,
    pathString: pathString,
    strokeLinecap: strokeLinecap,
    strokeWidth: strokeWidth,
    gapDegree: gapDegree,
    totalPercent: totalPercent
  }) :
  /*#__PURE__*/
  // Render single stroke
  _react.default.createElement("path", {
    d: pathString,
    strokeLinecap: strokeLinecap,
    className: prefix('stroke'),
    strokeWidth: totalPercent === 0 ? 0 : strokeWidth,
    fillOpacity: "0",
    style: strokePathStyle
  })));
});
ProgressCircle.displayName = 'ProgressCircle';
var _default = exports.default = ProgressCircle;