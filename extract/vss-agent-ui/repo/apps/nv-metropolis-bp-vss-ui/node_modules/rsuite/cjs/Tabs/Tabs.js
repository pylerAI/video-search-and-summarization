'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireDefault(require("react"));
var _Nav = _interopRequireDefault(require("../Nav"));
var _Tab = _interopRequireDefault(require("./Tab"));
var _TabPanel = _interopRequireDefault(require("./TabPanel"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
/**
 * Props for the Tabs component.
 */

function getFocusableTabs(tablist) {
  const tabs = tablist === null || tablist === void 0 ? void 0 : tablist.querySelectorAll('[role=tab]');
  return Array.from(tabs).filter(tab => !(tab.getAttribute('aria-disabled') === 'true'));
}
function getFocusedTab(tablist) {
  const tabs = getFocusableTabs(tablist);
  return tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
}
function nextItem(tablist) {
  if (!tablist) {
    return null;
  }
  const item = getFocusedTab(tablist);
  const items = getFocusableTabs(tablist);
  if (!item) {
    return items[0];
  }
  const nextItem = items[items.indexOf(item) + 1];
  if (!nextItem || nextItem.getAttribute('role') !== 'tab') {
    return items[0];
  }
  return nextItem;
}
function previousItem(tablist) {
  if (!tablist) {
    return null;
  }
  const item = getFocusedTab(tablist);
  const items = getFocusableTabs(tablist);
  if (!item) {
    return items[items.length - 1];
  }
  const previousItem = items[items.indexOf(item) - 1];
  if (!previousItem || previousItem.getAttribute('role') !== 'tab') {
    return items[items.length - 1];
  }
  return previousItem;
}
const renderPanels = (children, tabProps) => {
  const {
    id,
    activeKey
  } = tabProps;
  return _utils.rch.map(children, child => {
    const {
      eventKey,
      children
    } = child.props;
    const selected = eventKey === activeKey;
    return /*#__PURE__*/_react.default.createElement(_TabPanel.default, {
      "aria-labelledby": `${id}-${eventKey}`,
      "aria-hidden": !selected,
      id: `${id}-panel-${eventKey}`,
      active: selected
    }, children);
  });
};
const renderTabs = (children, tabPanelProps) => {
  const {
    id,
    activeKey
  } = tabPanelProps;
  return _utils.rch.map(children, child => {
    const {
      eventKey,
      title,
      disabled,
      icon
    } = child.props;
    const selected = eventKey === activeKey;
    return /*#__PURE__*/_react.default.createElement(_Nav.default.Item, {
      role: "tab",
      as: "button",
      type: "button",
      "aria-selected": selected,
      "aria-controls": `${id}-panel-${eventKey}`,
      "aria-disabled": disabled,
      "data-event-key": eventKey,
      disabled: disabled,
      icon: icon,
      id: `${id}-${eventKey}`,
      tabIndex: selected ? undefined : -1,
      eventKey: eventKey
    }, title);
  });
};
const Subcomponents = {
  Tab: _Tab.default
};

/**
 * Tabs are a set of layered sections of content, known as tab panels, that display one panel of content at a time.
 *
 * @version 5.53.0
 * @see https://rsuitejs.com/components/tabs
 */
const Tabs = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults,
    rtl
  } = (0, _hooks.useCustom)('Tabs', props);
  const {
    as,
    classPrefix = 'tabs',
    appearance = 'tabs',
    className,
    children,
    activeKey: activeKeyProp,
    defaultActiveKey,
    id: idProp,
    reversed,
    vertical,
    onSelect,
    ...rest
  } = propsWithDefaults;
  const id = (0, _hooks.useUniqueId)('tab-', idProp);
  const [activeKey, setActiveKey] = (0, _hooks.useControlled)(activeKeyProp, defaultActiveKey);
  const {
    withPrefix,
    prefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const tablistRef = _react.default.useRef(null);
  const handleSelect = (0, _hooks.useEventCallback)((eventKey, event) => {
    setActiveKey(eventKey);
    onSelect === null || onSelect === void 0 || onSelect(eventKey, event);
  });
  const handleKeyDown = (0, _hooks.useEventCallback)(event => {
    var _getFocusableTabs;
    const target = event.target;
    if (target.getAttribute('role') !== 'tab') {
      return;
    }
    let previousItemKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    let nextItemKey = vertical ? 'ArrowDown' : 'ArrowRight';
    if (!vertical && rtl) {
      previousItemKey = 'ArrowRight';
      nextItemKey = 'ArrowLeft';
    }
    let item = null;
    switch (event.key) {
      case previousItemKey:
        item = previousItem(tablistRef.current);
        event.preventDefault();
        break;
      case nextItemKey:
        item = nextItem(tablistRef.current);
        event.preventDefault();
        break;
      case 'Home':
        item = (_getFocusableTabs = getFocusableTabs(tablistRef.current)) === null || _getFocusableTabs === void 0 ? void 0 : _getFocusableTabs[0];
        event.preventDefault();
        break;
      case 'End':
        {
          const tabs = getFocusableTabs(tablistRef.current);
          item = tabs[tabs.length - 1];
          event.preventDefault();
          break;
        }
    }
    if (item) {
      const eventKey = item ? item.dataset.eventKey : undefined;
      handleSelect(eventKey, event);
      item.focus();
    }
  });
  const hasChildren = _react.default.Children.toArray(children).some(child => /*#__PURE__*/_react.default.isValidElement(child) && child.props.children);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    className: merge(className, withPrefix({
      reversed,
      vertical
    }))
  }, rest, {
    ref: ref
  }), /*#__PURE__*/_react.default.createElement(_Nav.default, {
    role: "tablist",
    "aria-orientation": vertical ? 'vertical' : 'horizontal',
    reversed: reversed,
    vertical: vertical,
    appearance: appearance,
    activeKey: activeKey,
    onSelect: handleSelect,
    onKeyDown: handleKeyDown,
    ref: tablistRef
  }, renderTabs(children, {
    id,
    activeKey
  })), hasChildren && /*#__PURE__*/_react.default.createElement("div", {
    className: prefix`content`
  }, renderPanels(children, {
    id,
    activeKey
  })));
}, Subcomponents);
Tabs.displayName = 'Tabs';
var _default = exports.default = Tabs;