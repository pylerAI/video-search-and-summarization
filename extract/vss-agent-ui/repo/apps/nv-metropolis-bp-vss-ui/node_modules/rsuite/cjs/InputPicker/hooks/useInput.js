'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _react = require("react");
var _useMaxWidth = _interopRequireDefault(require("./useMaxWidth"));
var _InputAutosize = _interopRequireDefault(require("../InputAutosize"));
const INPUT_MARGIN_RIGHT = 60;
function useInput(props) {
  const {
    multi,
    triggerRef
  } = props;
  const inputRef = (0, _react.useRef)(null);
  const maxWidth = (0, _useMaxWidth.default)(triggerRef);
  const getInput = (0, _react.useCallback)(() => {
    var _inputRef$current;
    return multi ? (_inputRef$current = inputRef.current) === null || _inputRef$current === void 0 ? void 0 : _inputRef$current.input : inputRef.current;
  }, [multi]);
  const focus = (0, _react.useCallback)(() => {
    var _getInput;
    (_getInput = getInput()) === null || _getInput === void 0 || _getInput.focus();
  }, [getInput]);
  const blur = (0, _react.useCallback)(() => {
    var _getInput2;
    (_getInput2 = getInput()) === null || _getInput2 === void 0 || _getInput2.blur();
  }, [getInput]);
  const inputProps = (0, _react.useMemo)(() => {
    return multi ? {
      inputStyle: {
        maxWidth: maxWidth - INPUT_MARGIN_RIGHT
      },
      as: _InputAutosize.default
    } : {
      as: 'input'
    };
  }, [maxWidth, multi]);
  return {
    inputProps,
    inputRef,
    focus,
    blur
  };
}
var _default = exports.default = useInput;