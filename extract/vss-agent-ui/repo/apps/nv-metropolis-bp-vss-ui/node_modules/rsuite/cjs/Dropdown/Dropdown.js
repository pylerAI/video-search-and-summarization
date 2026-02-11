'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _DropdownMenu = _interopRequireDefault(require("./DropdownMenu"));
var _DropdownItem = _interopRequireDefault(require("./DropdownItem"));
var _DropdownSeparator = _interopRequireDefault(require("./DropdownSeparator"));
var _DropdownContext = _interopRequireDefault(require("./DropdownContext"));
var _Menu = _interopRequireDefault(require("../internals/Menu/Menu"));
var _DropdownToggle = _interopRequireDefault(require("./DropdownToggle"));
var _NavContext = _interopRequireDefault(require("../Nav/NavContext"));
var _Nav = _interopRequireDefault(require("../Nav"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _DropdownState = require("./DropdownState");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _DropdownItem.default,
  Menu: _DropdownMenu.default,
  Separator: _DropdownSeparator.default
};
/**
 * The `Dropdown` component is used to select an option from a set of options.
 * @see https://rsuitejs.com/components/dropdown
 *
 * The `<Dropdown>` API
 * - When used inside `<Sidenav>`, renders a `<TreeviewRootItem>`;
 * - Otherwise renders a `<MenuRoot>`
 */
const Dropdown = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Dropdown', props);
  const {
    as: Component = 'div',
    activeKey,
    title,
    trigger = 'click',
    placement = 'bottomStart',
    toggleAs,
    toggleClassName,
    open,
    defaultOpen,
    classPrefix = 'dropdown',
    className,
    disabled,
    children,
    menuStyle,
    style,
    onClose,
    onOpen,
    onToggle,
    onSelect,
    ...toggleProps
  } = propsWithDefaults;
  const nav = (0, _react.useContext)(_NavContext.default);
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const {
    withPrefix: withMenuClassPrefix,
    merge: mergeMenuClassName
  } = (0, _hooks.useStyles)('dropdown-menu');
  const menuButtonTriggers = (0, _react.useMemo)(() => {
    if (!trigger) {
      return undefined;
    }
    const triggerMap = {
      hover: 'mouseover',
      click: 'click',
      contextMenu: 'contextmenu'
    };
    if (!Array.isArray(trigger)) {
      return [triggerMap[trigger]];
    }
    return trigger.map(t => triggerMap[t]);
  }, [trigger]);
  const [{
    items
  }, dispatch] = (0, _react.useReducer)(_DropdownState.reducer, _DropdownState.initialState);
  const hasSelectedItem = (0, _react.useMemo)(() => {
    return items.some(item => item.props.selected);
  }, [items]);
  const dropdownContextValue = (0, _react.useMemo)(() => {
    return {
      activeKey,
      onSelect,
      hasSelectedItem,
      dispatch
    };
  }, [activeKey, onSelect, hasSelectedItem, dispatch]);

  // Deprecate <Dropdown> within <Nav> usage
  // in favor of <Nav.Menu> API
  if (nav) {
    (0, _utils.warnOnce)('Usage of <Dropdown> within <Nav> is deprecated. Replace with <Nav.Menu>');
    return /*#__PURE__*/_react.default.createElement(_Nav.default.Menu, (0, _extends2.default)({
      ref: ref
    }, props));
  }
  const renderMenuButton = (menuButtonProps, menuButtonRef) => /*#__PURE__*/_react.default.createElement(_DropdownToggle.default, (0, _extends2.default)({
    ref: menuButtonRef,
    as: toggleAs,
    className: toggleClassName,
    placement: placement,
    disabled: disabled
  }, (0, _omit.default)(menuButtonProps, ['open']), (0, _omit.default)(toggleProps, ['data-testid'])), title);
  return /*#__PURE__*/_react.default.createElement(_DropdownContext.default.Provider, {
    value: dropdownContextValue
  }, /*#__PURE__*/_react.default.createElement(_Menu.default, {
    open: open,
    defaultOpen: defaultOpen,
    menuButtonText: title,
    renderMenuButton: renderMenuButton,
    disabled: disabled,
    openMenuOn: menuButtonTriggers,
    renderMenuPopup: ({
      open,
      ...popupProps
    }, popupRef) => {
      const menuClassName = mergeMenuClassName(className, withMenuClassPrefix({}));
      return /*#__PURE__*/_react.default.createElement("ul", (0, _extends2.default)({
        ref: popupRef,
        className: menuClassName,
        style: menuStyle,
        hidden: !open
      }, popupProps), children);
    },
    onToggleMenu: open => {
      onToggle === null || onToggle === void 0 || onToggle(open);
      if (open) {
        onOpen === null || onOpen === void 0 || onOpen();
      } else {
        onClose === null || onClose === void 0 || onClose();
      }
    }
  }, ({
    open,
    ...menuContainer
  }, menuContainerRef) => {
    const classes = merge(className, withPrefix());
    return /*#__PURE__*/_react.default.createElement(Component, (0, _extends2.default)({
      ref: (0, _utils.mergeRefs)(ref, menuContainerRef),
      className: classes,
      style: style,
      "data-placement": (0, _utils.kebabPlace)(placement),
      "data-disabled": disabled,
      "data-open": open,
      "data-active-descendant": hasSelectedItem
    }, menuContainer, (0, _pick.default)(toggleProps, ['data-testid'])));
  }));
}, Subcomponents);
Dropdown.displayName = 'Dropdown';
var _default = exports.default = Dropdown;