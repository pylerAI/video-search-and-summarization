'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _pick = _interopRequireDefault(require("lodash/pick"));
var _omit = _interopRequireDefault(require("lodash/omit"));
var _Combobox = _interopRequireDefault(require("./Combobox"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _hooks = require("../internals/hooks");
var _utils = require("../internals/utils");
var _utils2 = require("./utils");
var _Picker = require("../internals/Picker");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Autocomplete function of input field.
 * @see https://rsuitejs.com/components/auto-complete
 *
 * TODO: Remove unnecessary .rs-auto-complete element
 * TODO: role=combobox and aria-autocomplete on input element
 */
// Use type assertion to avoid type error with required properties
const AutoComplete = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('AutoComplete', props);
  const {
    as,
    disabled,
    className,
    placement = 'bottomStart',
    selectOnEnter = true,
    classPrefix = 'auto-complete',
    defaultValue = '',
    popupAutoWidth = true,
    popupClassName,
    popupStyle,
    data,
    value: valueProp,
    open,
    style,
    size,
    id,
    readOnly,
    plaintext,
    renderListbox,
    renderOption,
    onSelect,
    filterBy,
    onKeyDown,
    onChange,
    onClose,
    onOpen,
    onFocus,
    onBlur,
    onMenuFocus,
    ...rest
  } = propsWithDefaults;
  const datalist = (0, _utils2.transformData)(data);
  const [value, setValue] = (0, _hooks.useControlled)(valueProp, defaultValue);
  const [focus, setFocus] = (0, _react.useState)(false);
  const items = (datalist === null || datalist === void 0 ? void 0 : datalist.filter((0, _utils2.shouldDisplay)(filterBy, value))) || [];
  const hasItems = items.length > 0;
  const {
    trigger,
    overlay,
    root
  } = (0, _Picker.usePickerRef)(ref);
  const isMounted = (0, _hooks.useIsMounted)();

  // Used to hover the focuse item  when trigger `onKeydown`
  const {
    focusItemValue,
    setFocusItemValue,
    onKeyDown: handleKeyDown
  } = (0, _Picker.useFocusItemValue)(value, {
    data: datalist,
    focusToOption: false,
    callback: onMenuFocus,
    target: () => overlay.current
  });
  const handleKeyDownEvent = event => {
    if (!overlay.current) {
      return;
    }
    (0, _Picker.onMenuKeyDown)(event, {
      enter: selectOnEnter ? selectFocusMenuItem : undefined,
      esc: handleClose
    });
    handleKeyDown(event);
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(event);
  };
  const selectFocusMenuItem = event => {
    if (!focusItemValue) {
      return;
    }
    const focusItem = datalist.find(item => (item === null || item === void 0 ? void 0 : item.value) === focusItemValue);
    setValue(focusItemValue);
    setFocusItemValue(focusItemValue);
    handleSelect(focusItem, event);
    if (value !== focusItemValue) {
      handleChangeValue(focusItemValue, event);
    }
    handleClose();
  };
  const handleSelect = (0, _hooks.useEventCallback)((item, event) => {
    onSelect === null || onSelect === void 0 || onSelect(item.value, item, event);
  });
  const handleChangeValue = (0, _hooks.useEventCallback)((value, event) => {
    onChange === null || onChange === void 0 || onChange(value, event);
  });
  const handleChange = (value, event) => {
    setFocusItemValue('');
    setValue(value);
    setFocus(true);
    handleChangeValue(value, event);
  };
  const handleClose = (0, _hooks.useEventCallback)(() => {
    if (isMounted()) {
      setFocus(false);
      onClose === null || onClose === void 0 || onClose();
    }
  });
  const handleOpen = (0, _hooks.useEventCallback)(() => {
    setFocus(true);
    onOpen === null || onOpen === void 0 || onOpen();
  });
  const handleItemSelect = (0, _hooks.useEventCallback)((nextItemValue, item, event) => {
    setValue(nextItemValue);
    setFocusItemValue(nextItemValue);
    handleSelect(item, event);
    if (value !== nextItemValue) {
      handleChangeValue(nextItemValue, event);
    }
    handleClose();
  });
  const handleInputFocus = (0, _hooks.useEventCallback)(event => {
    onFocus === null || onFocus === void 0 || onFocus(event);
    handleOpen();
  });
  const handleInputBlur = (0, _hooks.useEventCallback)(event => {
    setTimeout(handleClose, 300);
    onBlur === null || onBlur === void 0 || onBlur(event);
  });
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix({
    disabled
  }));
  const [htmlInputProps, restProps] = (0, _utils.partitionHTMLProps)((0, _omit.default)(rest, _Picker.triggerPropKeys));
  const renderPopup = (positionProps, speakerRef) => {
    const {
      className
    } = positionProps;
    const classes = merge(className, popupClassName);
    const listbox = /*#__PURE__*/_react.default.createElement(_Picker.Listbox, {
      classPrefix: "auto-complete-menu",
      listItemClassPrefix: "auto-complete-item",
      listItemAs: _Picker.ListItem,
      focusItemValue: focusItemValue,
      onSelect: handleItemSelect,
      renderOption: renderOption,
      data: items,
      query: value
    });
    return /*#__PURE__*/_react.default.createElement(_Picker.PickerPopup, {
      ref: (0, _utils.mergeRefs)(overlay, speakerRef),
      className: classes,
      onKeyDown: handleKeyDownEvent,
      target: trigger,
      style: popupStyle,
      autoWidth: popupAutoWidth
    }, renderListbox ? renderListbox(listbox) : listbox);
  };
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, {
      ref: ref,
      localeKey: "unfilled"
    }, typeof value === 'undefined' ? defaultValue : value);
  }
  const expanded = open || focus && hasItems;
  const triggerProps = {
    ...(0, _pick.default)(props, _Picker.triggerPropKeys),
    open: expanded
  };
  return /*#__PURE__*/_react.default.createElement(_Picker.PickerToggleTrigger, (0, _extends2.default)({
    as: as,
    id: id,
    ref: trigger,
    placement: placement,
    triggerProps: triggerProps,
    trigger: ['click', 'focus'],
    speaker: renderPopup,
    className: classes,
    style: style,
    rootRef: root,
    responsive: false
  }, restProps), /*#__PURE__*/_react.default.createElement(_Combobox.default, (0, _extends2.default)({}, htmlInputProps, {
    disabled: disabled,
    value: value,
    size: size,
    readOnly: readOnly,
    expanded: expanded,
    focusItemValue: focusItemValue,
    onBlur: handleInputBlur,
    onFocus: handleInputFocus,
    onChange: handleChange,
    onKeyDown: handleKeyDownEvent
  })));
});
AutoComplete.displayName = 'AutoComplete';
var _default = exports.default = AutoComplete;