'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _uniq = _interopRequireDefault(require("lodash/uniq"));
var _remove = _interopRequireDefault(require("lodash/remove"));
var _hooks = require("../../internals/hooks");
var _utils = require("../utils");
/**
 * Get all parents of a node
 * @param node
 */
const getParents = node => {
  let parents = [];
  if (!node.parent) {
    return parents;
  }
  parents.push(node.parent);
  parents = parents.concat(getParents(node.parent));
  return parents;
};

/**
 * A hook that converts the value into a cascading value
 * @param props
 * @param flattenData
 */
function useCascadeValue(props, flattenData) {
  const {
    valueKey,
    childrenKey,
    uncheckableItemValues,
    cascade,
    value: valueProp,
    onChange,
    onCheck
  } = props;

  /**
   * Get the values of all children
   */
  const getChildrenValue = (0, _react.useCallback)(item => {
    let values = [];
    if (!item[childrenKey]) {
      return values;
    }
    item[childrenKey].forEach(n => {
      if (uncheckableItemValues && !uncheckableItemValues.some(v => v === n[valueKey])) {
        values.push(n[valueKey]);
      }
      values = values.concat(getChildrenValue(n));
    });
    return values;
  }, [childrenKey, uncheckableItemValues, valueKey]);
  const splitValue = (0, _react.useCallback)((item, checked, value) => {
    const itemValue = item[valueKey];
    const childrenValue = getChildrenValue(item);
    const parents = getParents(item);
    let nextValue = [...value];
    let removedValue = [];
    if (checked) {
      nextValue.push(itemValue);

      // Delete all values under the current node
      removedValue = removedValue.concat((0, _utils.removeAllChildrenValue)(nextValue, item, {
        valueKey,
        childrenKey
      }) || []);

      // Traverse all ancestor nodes of the current node
      // Then determine whether all the child nodes of these nodes are selected, and then they themselves must be selected
      for (let i = 0; i < parents.length; i++) {
        // Whether the parent node can be selected
        const isCheckableParent = !(uncheckableItemValues !== null && uncheckableItemValues !== void 0 && uncheckableItemValues.some(v => v === parents[i][valueKey]));
        if (isCheckableParent) {
          const isCheckAll = parents[i][childrenKey]
          // Filter out options that are marked as not selectable
          .filter(n => !(uncheckableItemValues !== null && uncheckableItemValues !== void 0 && uncheckableItemValues.some(v => v === n[valueKey])))
          // Check if all nodes are selected
          .every(n => nextValue.some(v => v === n[valueKey]));
          if (isCheckAll) {
            // Add parent node value
            nextValue.push(parents[i][valueKey]);

            // Delete all values under the parent node
            removedValue = removedValue.concat((0, _utils.removeAllChildrenValue)(nextValue, parents[i], {
              valueKey,
              childrenKey
            }) || []);
          }
        }
      }
    } else {
      const tempValue = childrenValue.concat(parents.map(item => item[valueKey]));
      nextValue = nextValue.concat((0, _utils.getOtherItemValuesByUnselectChild)(item, nextValue, {
        valueKey,
        childrenKey
      }));

      // Delete related child and parent nodes
      removedValue = (0, _remove.default)(nextValue, v => {
        // Delete yourself
        if (v === itemValue) {
          return true;
        }
        return tempValue.some(n => n === v);
      });
    }
    const uniqValue = (0, _uniq.default)(nextValue);
    const uniqRemovedValue = (0, _uniq.default)(removedValue);
    return {
      value: uniqValue,
      removedValue: uniqRemovedValue
    };
  }, [valueKey, childrenKey, uncheckableItemValues, getChildrenValue]);
  const transformValue = (0, _react.useCallback)((value = []) => {
    if (!cascade) {
      return value;
    }
    let tempRemovedValue = [];
    let nextValue = [];
    for (let i = 0; i < value.length; i++) {
      // If the value in the current value is already in the deleted list, it will not be processed
      if (tempRemovedValue.some(v => v === value[i])) {
        continue;
      }
      const item = flattenData.find(v => v[valueKey] === value[i]);
      if (!item) {
        continue;
      }
      const sv = splitValue(item, true, value);
      tempRemovedValue = (0, _uniq.default)(tempRemovedValue.concat(sv.removedValue));

      // Get all relevant values
      nextValue = (0, _uniq.default)(nextValue.concat(sv.value));
    }

    // Finally traverse all nextValue, and delete if its parent node is also nextValue
    return nextValue.filter(v => {
      const item = flattenData.find(n => n[valueKey] === v);
      if (item !== null && item !== void 0 && item.parent && nextValue.some(v => {
        var _item$parent;
        return v === ((_item$parent = item.parent) === null || _item$parent === void 0 ? void 0 : _item$parent[valueKey]);
      })) {
        return false;
      }
      return true;
    });
  }, [cascade, flattenData, splitValue, valueKey]);
  const [value, setValue] = (0, _react.useState)(transformValue(valueProp) || []);
  (0, _react.useEffect)(() => {
    // Update value when valueProp is updated.
    setValue(transformValue(valueProp) || []);
  }, [transformValue, valueProp]);
  const handleCheck = (0, _hooks.useEventCallback)((node, event, checked) => {
    const nodeValue = node[valueKey];
    let nextValue = [];
    if (cascade) {
      nextValue = splitValue(node, checked, value).value;
    } else {
      nextValue = [...value];
      if (checked) {
        nextValue.push(nodeValue);
      } else {
        nextValue = nextValue.filter(n => n !== nodeValue);
      }
    }
    setValue(nextValue);
    onChange === null || onChange === void 0 || onChange(nextValue, event);
    onCheck === null || onCheck === void 0 || onCheck(nextValue, node, checked, event);
  });
  return {
    value,
    setValue,
    splitValue,
    handleCheck
  };
}
var _default = exports.default = useCascadeValue;