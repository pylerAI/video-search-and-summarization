'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _classnames = _interopRequireDefault(require("classnames"));
var _MenuItem = _interopRequireDefault(require("../internals/Menu/MenuItem"));
var _DropdownContext = _interopRequireDefault(require("./DropdownContext"));
var _isNil = _interopRequireDefault(require("lodash/isNil"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _Nav = _interopRequireDefault(require("../Nav"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _Text = _interopRequireDefault(require("../Text"));
var _DropdownSeparator = _interopRequireDefault(require("./DropdownSeparator"));
var _useRenderMenuItem = require("../internals/Menu/useRenderMenuItem");
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _DropdownState = require("./DropdownState");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `<Dropdown.Item>` API
 * - When used inside `<Sidenav>`, renders a `<TreeviewItem>`
 * - Otherwise renders a `<MenuItem>`
 */
const DropdownItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as = 'li',
    active: activeProp,
    classPrefix = 'dropdown-item',
    className,
    children,
    shortcut,
    disabled,
    description,
    divider,
    eventKey,
    icon,
    panel,
    onSelect,
    ...restProps
  } = props;
  const internalId = (0, _hooks.useInternalId)('DropdownItem');
  const nav = (0, _react.useContext)(_NavContext.default);
  const dropdown = (0, _react.useContext)(_DropdownContext.default);
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const handleSelectItem = (0, _react.useCallback)(event => {
    var _dropdown$onSelect;
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
    dropdown === null || dropdown === void 0 || (_dropdown$onSelect = dropdown.onSelect) === null || _dropdown$onSelect === void 0 || _dropdown$onSelect.call(dropdown, eventKey, event);
  }, [onSelect, eventKey, dropdown]);
  const selected = activeProp || !(0, _isNil.default)(eventKey) && (0, _utils.shallowEqual)(dropdown === null || dropdown === void 0 ? void 0 : dropdown.activeKey, eventKey);
  const dispatch = dropdown === null || dropdown === void 0 ? void 0 : dropdown.dispatch;
  (0, _react.useEffect)(() => {
    if (dispatch) {
      dispatch({
        type: _DropdownState.DropdownActionType.RegisterItem,
        payload: {
          id: internalId,
          props: {
            selected
          }
        }
      });
      return () => {
        dispatch({
          type: _DropdownState.DropdownActionType.UnregisterItem,
          payload: {
            id: internalId
          }
        });
      };
    }
  }, [internalId, selected, dispatch]);
  const renderDropdownItem = (0, _useRenderMenuItem.useRenderMenuItem)(as);

  // If using <Dropdown.Item> within <Nav>
  // Suggest <Nav.Item>
  if (nav) {
    (0, _utils.warnOnce)('Usage of <Dropdown.Item> within <Nav> is deprecated. Replace with <Nav.Item> within <Nav.Menu>.');
    return /*#__PURE__*/_react.default.createElement(_Nav.default.Item, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  if (divider) {
    return /*#__PURE__*/_react.default.createElement(_DropdownSeparator.default, (0, _extends2.default)({
      as: "li"
    }, (0, _pick.default)(props, ['data-testid'])));
  }
  if (panel) {
    return renderDropdownItem({
      ref,
      className: merge(prefix('panel'), className),
      children,
      ...restProps
    });
  }
  return /*#__PURE__*/_react.default.createElement(_MenuItem.default, {
    selected: selected,
    disabled: disabled,
    onActivate: handleSelectItem
  }, ({
    selected,
    active,
    ...menuitem
  }, menuitemRef) => {
    const classes = merge(className, withPrefix({
      divider,
      panel
    }));
    const dataAttributes = {
      'data-disabled': disabled,
      'data-focus': active,
      'data-active': selected,
      'data-with-icon': !!icon,
      'data-event-key': eventKey
    };
    if (!(0, _isNil.default)(eventKey) && typeof eventKey !== 'string') {
      dataAttributes['data-event-key-type'] = typeof eventKey;
    }
    return renderDropdownItem({
      ref: (0, _utils.mergeRefs)(ref, menuitemRef),
      className: classes,
      ...menuitem,
      ...dataAttributes,
      ...restProps,
      children: /*#__PURE__*/_react.default.createElement(_react.default.Fragment, null, icon && /*#__PURE__*/_react.default.cloneElement(icon, {
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
DropdownItem.displayName = 'Dropdown.Item';
var _default = exports.default = DropdownItem;