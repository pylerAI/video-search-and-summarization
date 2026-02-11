'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The Carousel component is used to display a series of content.
 * @see https://rsuitejs.com/components/carousel
 */
const Carousel = (0, _utils.forwardRef)((props, ref) => {
  const {
    rtl,
    propsWithDefaults
  } = (0, _hooks.useCustom)('Carousel', props);
  const {
    as,
    children,
    classPrefix = 'carousel',
    className,
    placement = 'bottom',
    shape = 'dot',
    autoplay,
    autoplayInterval = 4000,
    activeIndex: activeIndexProp,
    defaultActiveIndex = 0,
    onSelect,
    onSlideStart,
    onSlideEnd,
    ...rest
  } = propsWithDefaults;
  const {
    prefix,
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const count = _utils.rch.count(children);
  const labels = [];
  const vertical = placement === 'left' || placement === 'right';
  const lengthKey = vertical ? 'height' : 'width';
  const [activeIndex, setActiveIndex, isControlled] = (0, _hooks.useControlled)(activeIndexProp, defaultActiveIndex);
  const [lastIndex, setLastIndex] = (0, _react.useState)(0);
  const rootRef = (0, _react.useRef)(null);
  (0, _hooks.useUpdateEffect)(() => {
    // When the index is controlled, the index is not updated when the number of children changes.
    if (isControlled) {
      return;
    }
    // Reset the index when the number of children changes.
    setActiveIndex(0);
  }, [children, isControlled]);

  // Set a timer for automatic playback.
  // `autoplay` needs to be cast to boolean type to avoid undefined parameters.
  const {
    clear,
    reset
  } = (0, _hooks.useTimeout)(() => handleSlide(), autoplayInterval, !!autoplay && count > 1);
  const handleSlide = (0, _react.useCallback)((nextActiveIndex, event) => {
    if (!rootRef.current) {
      return;
    }
    clear();
    const index = nextActiveIndex !== null && nextActiveIndex !== void 0 ? nextActiveIndex : activeIndex + 1;

    // When index is greater than count, start from 1 again.
    const nextIndex = index % count;
    setActiveIndex(nextIndex);
    onSlideStart === null || onSlideStart === void 0 || onSlideStart(nextIndex, event);
    setLastIndex(nextActiveIndex == null ? activeIndex : nextIndex);
    reset();
  }, [activeIndex, count, setActiveIndex, clear, onSlideStart, reset]);
  const handleChange = event => {
    const activeIndex = +event.target.value;
    handleSlide(activeIndex, event);
    onSelect === null || onSelect === void 0 || onSelect(activeIndex, event);
  };
  const handleTransitionEnd = (0, _react.useCallback)(event => {
    onSlideEnd === null || onSlideEnd === void 0 || onSlideEnd(activeIndex, event);
  }, [activeIndex, onSlideEnd]);
  const uniqueId = (0, _react.useMemo)(() => (0, _utils.guid)(), []);
  const items = _utils.rch.map(children, (child, index) => {
    var _child$props;
    if (!child) {
      return;
    }
    const inputKey = `indicator_${uniqueId}_${index}`;
    labels.push(/*#__PURE__*/_react.default.createElement("li", {
      key: `label${index}`,
      className: prefix('label-wrapper')
    }, /*#__PURE__*/_react.default.createElement("input", {
      name: inputKey,
      id: inputKey,
      type: "radio",
      onChange: handleChange,
      value: index,
      checked: activeIndex === index
    }), /*#__PURE__*/_react.default.createElement("label", {
      htmlFor: inputKey,
      className: prefix('label')
    })));
    return /*#__PURE__*/_react.default.cloneElement(child, {
      key: `slider-item${index}`,
      'aria-hidden': activeIndex !== index,
      style: {
        ...child.props.style,
        [lengthKey]: `${100 / count}%`
      },
      className: (0, _classnames.default)(prefix('slider-item'), (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.className)
    });
  });
  const classes = merge(className, withPrefix(`placement-${placement}`, `shape-${shape}`));
  const positiveOrder = vertical || !rtl;
  const sign = positiveOrder ? '-' : '';
  const activeRatio = `${sign}${100 / count * activeIndex}%`;
  const sliderStyles = {
    [lengthKey]: `${count * 100}%`,
    transform: vertical ? `translate3d(0, ${activeRatio} ,0)` : `translate3d(${activeRatio}, 0 ,0)`
  };
  const showMask = count > 1 && activeIndex === 0 && activeIndex !== lastIndex;
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as
  }, rest, {
    ref: (0, _utils.mergeRefs)(ref, rootRef),
    className: classes
  }), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('content')
  }, /*#__PURE__*/_react.default.createElement("div", {
    "data-testid": "carousel-slider",
    className: prefix('slider'),
    style: sliderStyles,
    onTransitionEnd: handleTransitionEnd
  }, items), showMask && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('slider-after', {
      'slider-after-vertical': vertical
    }),
    style: {
      [lengthKey]: '200%'
    }
  }, [items[items.length - 1], items[0]].map(node => /*#__PURE__*/_react.default.cloneElement(node, {
    key: node.key,
    style: {
      ...node.props.style,
      [lengthKey]: '50%'
    }
  })))), /*#__PURE__*/_react.default.createElement("div", {
    className: prefix('toolbar')
  }, /*#__PURE__*/_react.default.createElement("ul", null, labels)));
});
Carousel.displayName = 'Carousel';
var _default = exports.default = Carousel;