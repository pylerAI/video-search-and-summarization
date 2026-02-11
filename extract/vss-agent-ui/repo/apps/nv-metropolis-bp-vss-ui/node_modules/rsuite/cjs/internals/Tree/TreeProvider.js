'use client';
"use strict";

exports.__esModule = true;
exports.useTreeImperativeHandle = exports.useTreeCustomRenderer = exports.useTreeContextProps = exports.useRegisterTreeMethods = exports.useItemDataKeys = exports.TreeProvider = void 0;
var _react = require("react");
const defaultItemDataKeys = {
  labelKey: 'label',
  valueKey: 'value',
  childrenKey: 'children',
  virtualized: false
};
const TreeContext = /*#__PURE__*/(0, _react.createContext)({
  props: defaultItemDataKeys
});
const TreeProvider = exports.TreeProvider = TreeContext.Provider;
const useRegisterTreeMethods = () => {
  const {
    register
  } = (0, _react.useContext)(TreeContext);
  return register;
};
exports.useRegisterTreeMethods = useRegisterTreeMethods;
const useTreeCustomRenderer = () => {
  const {
    props: {
      renderTreeIcon,
      renderTreeNode
    }
  } = (0, _react.useContext)(TreeContext);
  return {
    renderTreeIcon,
    renderTreeNode
  };
};
exports.useTreeCustomRenderer = useTreeCustomRenderer;
const useItemDataKeys = () => {
  const {
    props: {
      labelKey,
      valueKey,
      childrenKey
    } = defaultItemDataKeys
  } = (0, _react.useContext)(TreeContext);
  return {
    labelKey,
    valueKey,
    childrenKey
  };
};
exports.useItemDataKeys = useItemDataKeys;
const useTreeContextProps = () => {
  const {
    props
  } = (0, _react.useContext)(TreeContext);
  return props;
};

/**
 * Custom hook that provides imperative handle for the Tree component.
 */
exports.useTreeContextProps = useTreeContextProps;
const useTreeImperativeHandle = () => {
  const focusFirstNodeRef = (0, _react.useRef)(null);
  const focusActiveNodeRef = (0, _react.useRef)(null);
  const register = (0, _react.useCallback)(({
    focusTreeFirstNode,
    focusTreeActiveNode
  }) => {
    focusFirstNodeRef.current = focusTreeFirstNode;
    focusActiveNodeRef.current = focusTreeActiveNode;
    return () => {
      focusFirstNodeRef.current = null;
      focusActiveNodeRef.current = null;
    };
  }, []);
  return {
    register,
    focusFirstNode: () => {
      var _focusFirstNodeRef$cu;
      return (_focusFirstNodeRef$cu = focusFirstNodeRef.current) === null || _focusFirstNodeRef$cu === void 0 ? void 0 : _focusFirstNodeRef$cu.call(focusFirstNodeRef);
    },
    focusActiveNode: () => {
      var _focusActiveNodeRef$c;
      return (_focusActiveNodeRef$c = focusActiveNodeRef.current) === null || _focusActiveNodeRef$c === void 0 ? void 0 : _focusActiveNodeRef$c.call(focusActiveNodeRef);
    }
  };
};
exports.useTreeImperativeHandle = useTreeImperativeHandle;