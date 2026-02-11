'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _Pagination = _interopRequireDefault(require("./Pagination"));
var _Divider = _interopRequireDefault(require("../Divider"));
var _Input = _interopRequireDefault(require("../Input"));
var _LimitPicker = _interopRequireDefault(require("./LimitPicker"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
/**
 * The layout of the paging component.
 */

const defaultLayout = ['pager'];
const defaultLimitOptions = [30, 50, 100];

/**
 * Pagination component for displaying page numbers.
 *
 * @see https://rsuitejs.com/components/pagination
 */
const PaginationGroup = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    activePage: activePageProp,
    classPrefix = 'pagination-group',
    className,
    disabled,
    size,
    style,
    total,
    prev,
    next,
    first,
    last,
    limitOptions = defaultLimitOptions,
    limit: limitProp,
    locale: localeProp,
    layout = defaultLayout,
    maxButtons,
    onChangePage,
    onChangeLimit,
    ...rest
  } = props;
  const {
    merge,
    prefix,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const [limit, setLimit] = (0, _hooks.useControlled)(limitProp, 30);
  const [activePage, setActivePage] = (0, _hooks.useControlled)(activePageProp, 1);
  const pages = Math.floor(total / limit) + (total % limit ? 1 : 0);
  const classes = merge(className, withPrefix());
  const {
    getLocale
  } = (0, _hooks.useCustom)();
  const locale = getLocale('Pagination', localeProp);
  const handleInputBlur = (0, _hooks.useEventCallback)(event => {
    const value = parseInt(event.target.value);
    if (value > 0 && value <= pages) {
      onChangePage === null || onChangePage === void 0 || onChangePage(value);
      setActivePage(value);
    }
    event.target.value = '';
  });
  const handleInputPressEnter = (0, _hooks.useEventCallback)(event => {
    var _event$target;
    (_event$target = event.target) === null || _event$target === void 0 || _event$target.blur();
  });
  const handleChangeLimit = (0, _hooks.useEventCallback)(value => {
    setLimit(value);
    onChangeLimit === null || onChangeLimit === void 0 || onChangeLimit(value);
  });
  return /*#__PURE__*/_react.default.createElement(_Box.default, {
    as: as,
    ref: ref,
    className: classes,
    "data-size": size,
    style: style
  }, layout.map((key, index) => {
    const onlyKey = `${key}${index}`;
    switch (key) {
      case '-':
        return /*#__PURE__*/_react.default.createElement("div", {
          className: prefix('grow'),
          key: onlyKey
        });
      case '|':
        return /*#__PURE__*/_react.default.createElement(_Divider.default, {
          vertical: true,
          key: onlyKey
        });
      case 'pager':
        return /*#__PURE__*/_react.default.createElement(_Pagination.default, (0, _extends2.default)({
          key: onlyKey,
          size: size,
          prev: prev,
          next: next,
          first: first,
          last: last,
          maxButtons: maxButtons,
          pages: pages,
          disabled: disabled,
          onSelect: onChangePage // fixme don't use any
          ,
          activePage: activePage
        }, rest));
      case 'total':
        return /*#__PURE__*/_react.default.createElement("div", {
          key: onlyKey,
          className: prefix('total')
        }, locale.total && (0, _utils.tplTransform)(locale.total, total));
      case 'skip':
        return /*#__PURE__*/_react.default.createElement("div", {
          key: onlyKey,
          className: (0, _classnames.default)(prefix('skip'))
        }, locale.skip && (0, _utils.tplTransform)(locale.skip, /*#__PURE__*/_react.default.createElement(_Input.default, {
          size: size,
          disabled: typeof disabled === 'function' ? disabled('skip') : Boolean(disabled),
          onBlur: handleInputBlur,
          onPressEnter: handleInputPressEnter
        })));
      case 'limit':
        return /*#__PURE__*/_react.default.createElement(_LimitPicker.default, {
          key: onlyKey,
          size: size,
          locale: locale,
          limit: limit,
          onChangeLimit: handleChangeLimit,
          limitOptions: limitOptions,
          disabled: disabled,
          prefix: prefix
        });
      default:
        return key;
    }
  }));
});
PaginationGroup.displayName = 'PaginationGroup';
var _default = exports.default = PaginationGroup;