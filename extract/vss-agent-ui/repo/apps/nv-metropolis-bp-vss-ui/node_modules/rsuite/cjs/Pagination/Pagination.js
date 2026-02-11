'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _More = _interopRequireDefault(require("@rsuite/icons/More"));
var _PagePrevious = _interopRequireDefault(require("@rsuite/icons/PagePrevious"));
var _PageTop = _interopRequireDefault(require("@rsuite/icons/PageTop"));
var _PageNext = _interopRequireDefault(require("@rsuite/icons/PageNext"));
var _PageEnd = _interopRequireDefault(require("@rsuite/icons/PageEnd"));
var _PaginationButton = _interopRequireDefault(require("./PaginationButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
const icons = {
  more: /*#__PURE__*/_react.default.createElement(_More.default, null),
  first: /*#__PURE__*/_react.default.createElement(_PageTop.default, null),
  last: /*#__PURE__*/_react.default.createElement(_PageEnd.default, null),
  prev: /*#__PURE__*/_react.default.createElement(_PagePrevious.default, null),
  next: /*#__PURE__*/_react.default.createElement(_PageNext.default, null)
};
/**
 * Pagination component for displaying page numbers.
 *
 * @see https://rsuitejs.com/components/pagination
 */
const Pagination = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Pagination', props);
  const {
    as,
    className,
    classPrefix = 'pagination',
    disabled: disabledProp,
    locale,
    activePage = 1,
    maxButtons,
    pages = 1,
    ellipsis,
    boundaryLinks,
    first,
    prev,
    next,
    last,
    size = 'sm',
    linkAs,
    linkProps,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const renderItem = (key, itemProps) => {
    const {
      eventKey,
      disabled,
      ...itemRest
    } = itemProps;
    let disabledButton = disabled;
    if (typeof disabledProp !== 'undefined') {
      disabledButton = typeof disabledProp === 'function' ? disabledProp(eventKey) : disabledProp;
    }
    const title = (locale === null || locale === void 0 ? void 0 : locale[key]) || eventKey;
    return /*#__PURE__*/_react.default.createElement(_PaginationButton.default, (0, _extends2.default)({
      "aria-label": title,
      title: title
    }, itemRest, linkProps, {
      key: `${key}-${eventKey}`,
      eventKey: eventKey,
      as: linkAs,
      size: size,
      disabled: disabledButton,
      onSelect: disabledButton ? undefined : onSelect
    }));
  };
  const renderFirst = () => {
    if (!first) {
      return null;
    }
    return renderItem('first', {
      eventKey: 1,
      disabled: activePage === 1,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix`symbol`
      }, first === true ? icons.first : first)
    });
  };
  const renderPrev = () => {
    if (!prev) {
      return null;
    }
    return renderItem('prev', {
      eventKey: activePage - 1,
      disabled: activePage === 1,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix`symbol`
      }, prev === true ? icons.prev : prev)
    });
  };
  const renderPageButtons = () => {
    const pageButtons = [];
    let startPage;
    let endPage;
    let shouldShowEllipsisAfter;
    if (maxButtons) {
      const hiddenPagesBefore = activePage - Math.floor(maxButtons / 2);
      startPage = hiddenPagesBefore > 1 ? hiddenPagesBefore : 1;
      shouldShowEllipsisAfter = startPage + maxButtons <= pages;
      if (!shouldShowEllipsisAfter) {
        endPage = pages;
        startPage = pages - maxButtons + 1;
        if (startPage < 1) {
          startPage = 1;
        }
      } else {
        endPage = startPage + maxButtons - 1;
      }
    } else {
      startPage = 1;
      endPage = pages;
    }
    for (let pagenumber = startPage; pagenumber <= endPage; pagenumber += 1) {
      pageButtons.push(renderItem(pagenumber, {
        eventKey: pagenumber,
        active: pagenumber === activePage,
        children: pagenumber
      }));
    }
    if (boundaryLinks && ellipsis && startPage !== 1) {
      pageButtons.unshift(renderItem('more', {
        eventKey: 'ellipsisFirst',
        disabled: true,
        children: /*#__PURE__*/_react.default.createElement("span", {
          className: prefix`symbol`
        }, ellipsis === true ? icons.more : ellipsis)
      }));
      pageButtons.unshift(renderItem(1, {
        eventKey: 1,
        children: 1
      }));
    }
    if (maxButtons && shouldShowEllipsisAfter && ellipsis) {
      pageButtons.push(renderItem('more', {
        eventKey: 'ellipsis',
        disabled: true,
        children: /*#__PURE__*/_react.default.createElement("span", {
          className: prefix`symbol`
        }, ellipsis === true ? icons.more : ellipsis)
      }));
      if (boundaryLinks && endPage !== pages) {
        pageButtons.push(renderItem(pages, {
          eventKey: pages,
          disabled: false,
          children: pages
        }));
      }
    }
    return pageButtons;
  };
  const renderNext = () => {
    if (!next) {
      return null;
    }
    return renderItem('next', {
      eventKey: activePage + 1,
      disabled: activePage >= pages,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix`symbol`
      }, next === true ? icons.next : next)
    });
  };
  const renderLast = () => {
    if (!last) {
      return null;
    }
    return renderItem('last', {
      eventKey: pages,
      disabled: activePage >= pages,
      children: /*#__PURE__*/_react.default.createElement("span", {
        className: prefix`symbol`
      }, last === true ? icons.last : last)
    });
  };
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-size": size
  }, rest), renderFirst(), renderPrev(), renderPageButtons(), renderNext(), renderLast());
});
Pagination.displayName = 'Pagination';
var _default = exports.default = Pagination;