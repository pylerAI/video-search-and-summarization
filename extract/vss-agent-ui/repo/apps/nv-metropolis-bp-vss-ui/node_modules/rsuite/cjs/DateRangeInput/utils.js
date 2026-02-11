'use client';
"use strict";

exports.__esModule = true;
exports.DateType = void 0;
exports.getDateType = getDateType;
exports.getInputSelectedState = getInputSelectedState;
exports.isSwitchDateType = isSwitchDateType;
var _DateInput = require("../DateInput");
let DateType = exports.DateType = /*#__PURE__*/function (DateType) {
  DateType["Start"] = "Start";
  DateType["End"] = "End";
  return DateType;
}({});
function getInputSelectedState(options) {
  const {
    input,
    direction,
    formatStr,
    rangeFormatStr,
    localize,
    selectedMonth,
    valueOffset = 0,
    character,
    dateType,
    dateString
  } = options;
  const getPatternSelectedIndexes = pattern => {
    let selectionStart = 0;
    let selectionEnd = 0;
    if (dateType === DateType.Start) {
      selectionStart = rangeFormatStr.indexOf(pattern);
      selectionEnd = rangeFormatStr.split(character)[0].lastIndexOf(pattern) + 1;
    } else if (dateType === DateType.End) {
      const position = rangeFormatStr.indexOf(character) + character.length;
      selectionStart = rangeFormatStr.indexOf(pattern, position);
      selectionEnd = rangeFormatStr.lastIndexOf(pattern) + 1;
    }
    const endDateGap = dateString.indexOf(character) - rangeFormatStr.indexOf(character);

    // If the date type is end, and the end date is not selected, the selection range needs to be adjusted.
    if (dateType === DateType.End && endDateGap > 0) {
      selectionStart += endDateGap;
      selectionEnd += endDateGap;
    }
    const gap = (0, _DateInput.getSelectIndexGap)({
      pattern,
      formatStr,
      valueOffset,
      selectedMonth,
      localize
    });
    const isSelectedMonth = pattern === 'M';
    const isNullMonth = selectedMonth === null && !(isSelectedMonth && valueOffset !== 0);

    // If the month is null and the valueOffset is 0, the month will not be updated, and the gap is 0 at this time.
    if (isNullMonth) {
      return {
        selectionStart,
        selectionEnd
      };
    }
    if (isSelectedMonth) {
      return {
        selectionStart,
        selectionEnd: selectionEnd + gap
      };
    }
    if ((0, _DateInput.isCursorAfterMonth)(selectionStart, formatStr)) {
      return {
        selectionStart: selectionStart + gap,
        selectionEnd: selectionEnd + gap
      };
    }
    return {
      selectionStart,
      selectionEnd
    };
  };
  if (typeof input.selectionEnd === 'number' && typeof input.selectionStart === 'number') {
    let index = input.selectionStart;
    let positionOffset = -1;
    if (direction === 'left') {
      index = input.selectionStart - 1;
    } else if (direction === 'right') {
      index = input.selectionEnd + 1;
      positionOffset = 1;
    }

    // The start position of the index of the end date
    const endDateIndex = dateString.indexOf(character) + character.length;
    const datePattern = (0, _DateInput.getDatePattern)({
      selectionIndex: dateType === DateType.End ? index - endDateIndex : index,
      positionOffset,
      formatStr,
      dateString,
      valueOffset,
      selectedMonth,
      localize
    });
    const indexes = getPatternSelectedIndexes(datePattern);
    return {
      selectedPattern: datePattern,
      ...indexes
    };
  }
  return {
    selectedPattern: 'y',
    selectionStart: 0,
    selectionEnd: 0
  };
}
function getDateType(dateString, character, cursorIndex) {
  const splitIndex = dateString.indexOf(character);
  if (cursorIndex > splitIndex) {
    return DateType.End;
  }
  return DateType.Start;
}
function isSwitchDateType(dateString, character, cursorIndex, direction) {
  const characterIndex = dateString.indexOf(character);
  let startIndex = cursorIndex;
  let endIndex = startIndex + character.length;
  if (direction === 'left') {
    endIndex = cursorIndex;
    startIndex = endIndex - character.length;
  }

  // Check whether the cursor is a separator before and after
  if (dateString.substring(startIndex, endIndex) === character) {
    return true;
  }

  // Check whether the cursor is a number or letter before and after. If not, switch the date type.
  // eg: `2020年12月01日`, the cursor is behind 01, press the right key, and switch to the end date.
  if (direction === 'right') {
    if (!dateString.substring(cursorIndex, characterIndex).match(/[0-9a-zA-Z]/)) {
      return true;
    }
  }
  if (!dateString.substring(characterIndex, cursorIndex).match(/[0-9a-zA-Z]/)) {
    return true;
  }
  return false;
}