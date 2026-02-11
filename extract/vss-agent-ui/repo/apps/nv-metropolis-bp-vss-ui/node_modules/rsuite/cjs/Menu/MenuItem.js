'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _MenuContext = _interopRequireDefault(require("./MenuContext"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _Text = _interopRequireDefault(require("../Text"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const MenuItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'menu-item',
    className,
    description,
    shortcut,
    eventKey,
    icon,
    children,
    disabled,
    onSelect,
    ...rest
  } = props;
  const menu = (0, _react.useContext)(_MenuContext.default);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleSelectItem = (0, _react.useCallback)(event => {
    var _menu$onSelect;
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    menu === null || menu === void 0 || (_menu$onSelect = menu.onSelect) === null || _menu$onSelect === void 0 || _menu$onSelect.call(menu, eventKey, event);
  }, [onSelect, eventKey, menu]);
  const selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(menu === null || menu === void 0 ? void 0 : menu.activeKey, eventKey);
  const renderMenuItem = (0, _useRenderMenuItem.useRenderMenuItem)(as);
  return /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
    selected: selected,
    disabled: disabled,
    onActivate: handleSelectItem
  }, ({
    selected,
    active,
    ...menuitem
  }, menuitemRef) => {
    const classes = merge(className, withPrefix());
    const dataAttributes = {
      'data-active': selected,
      'data-disabled': disabled,
      'data-focus': active
    };
    return renderMenuItem({
      ref: (0, _utils.mergeRefs)(ref, menuitemRef),
      className: classes,
      ...dataAttributes,
      ...menuitem,
      ...rest,
      children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/(0, _react.cloneElement)(icon, {
        className: (0, _classnames.default)(prefix('menu-icon'), icon.props.className)
      }), /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('content')
      }, /*#__PURE__*/_react.default.createElement(_Text.default, {
        as: "span"
      }, children), /*#__PURE__*/_react.default.createElement(_Text.default, {
        as: "span",
        muted: true
      }, description)), shortcut && /*#__PURE__*/_react.default.createElement(_Text.default, {
        as: "kbd",
        className: prefix('shortcut'),
        muted: true
      }, shortcut))
    });
  });
});
MenuItem.displayName = 'MenuItem';
var _default = exports.default = MenuItem;