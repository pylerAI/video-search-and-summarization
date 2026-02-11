'use client';
"use strict";

exports.__esModule = true;
exports.getDatePattern = getDatePattern;
exports.getInputSelectedState = getInputSelectedState;
exports.getPatternGroups = getPatternGroups;
exports.getSelectIndexGap = getSelectIndexGap;
exports.isCursorAfterMonth = isCursorAfterMonth;
exports.modifyDate = modifyDate;
exports.useInputSelection = useInputSelection;
exports.validateDateTime = validateDateTime;
var _date = require("../internals/utils/date");
var _utils = require("../internals/utils");
function getPatternGroups(format, pattern) {
  var _format$match;
  return ((_format$match = format.match(new RegExp(`(${pattern})+`))) === null || _format$match === void 0 ? void 0 : _format$match[0]) || '';
}
function getSelectIndexGap(options) {
  const {
    pattern,
    formatStr,
    valueOffset,
    selectedMonth,
    localize
  } = options;
  let gap = 0;
  const monthIsAbbreviated = formatStr.includes('MMM');
  const monthIsFull = formatStr.includes('MMMM');

  // If the month is abbreviated or full, the gap needs to be adjusted.
  if (monthIsAbbreviated || monthIsFull) {
    const isSelectedMonth = pattern === 'M';

    // If the selected is the month, and the valueOffset is null,
    // it means that the delete key is pressed, and the default pattern is displayed, and the gap is 0 at this time.
    if (isSelectedMonth && valueOffset === null) {
      return 0;
    }

    // If the month is null and the valueOffset is 0, the month will not be updated, and the gap is 0 at this time.
    if (selectedMonth === null && valueOffset === 0) {
      return 0;
    }
    let month = selectedMonth ? selectedMonth + (isSelectedMonth ? valueOffset || 0 : 0) : 1;
    if (month > 12) {
      month = 1;
    } else if (month === 0) {
      month = 12;
    }
    const monthStr = localize === null || localize === void 0 ? void 0 : localize.month(month - 1, {
      width: monthIsFull ? 'wide' : 'abbreviated'
    });
    gap = monthStr.length - (monthIsFull ? 4 : 3);
  }
  return gap;
}
function getDatePattern(options) {
  const {
    selectionIndex,
    positionOffset = -1,
    formatStr,
    dateString,
    valueOffset,
    selectedMonth,
    localize
  } = options;
  let pattern = formatStr.charAt(selectionIndex || 0);
  if (selectionIndex < 0 || selectionIndex > dateString.length - 1) {
    pattern = formatStr.trim().charAt(0);
    return pattern;
  }
  let gap = 0;
  if (isCursorAfterMonth(selectionIndex, formatStr)) {
    gap = getSelectIndexGap({
      pattern,
      formatStr,
      valueOffset,
      selectedMonth,
      localize
    });
  }
  pattern = formatStr.charAt(selectionIndex - gap);

  // If the pattern is not a letter, then get the pattern from the previous or next letter.
  if (!pattern.match(/[y|d|M|H|h|m|s|a]/)) {
    const nextIndex = selectionIndex + positionOffset;
    pattern = getDatePattern({
      ...options,
      selectionIndex: nextIndex
    });
  }
  return pattern;
}

// Determine whether the cursor is after the month.
// If the currently operated field is after the month, the selected field needs to be moved backward.
function isCursorAfterMonth(cursorIndex, formatStr) {
  return cursorIndex > formatStr.indexOf('M');
}
function getInputSelectedState(options) {
  const {
    input,
    direction,
    formatStr,
    localize,
    selectedMonth,
    dateString,
    valueOffset = 0
  } = options;
  const getPatternSelectedIndexes = pattern => {
    const selectionStart = formatStr.indexOf(pattern);
    const selectionEnd = formatStr.lastIndexOf(pattern) + 1;
    const gap = getSelectIndexGap({
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
    if (isCursorAfterMonth(selectionStart, formatStr)) {
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
    let selectionIndex = input.selectionStart;
    let positionOffset = -1;
    if (direction === 'left') {
      selectionIndex = input.selectionStart - 1;
    } else if (direction === 'right') {
      selectionIndex = input.selectionEnd + 1;
      positionOffset = 1;
    }
    const datePattern = getDatePattern({
      selectionIndex,
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
function validateDateTime(type, value) {
  switch (type) {
    case 'year':
      if (value < 1 || value > 9999) {
        return false;
      }
      break;
    case 'month':
      if (value < 1 || value > 12) {
        return false;
      }
      break;
    case 'day':
      if (value < 1 || value > 31) {
        return false;
      }
      break;
    case 'hour':
      if (value < 0 || value > 23) {
        return false;
      }
      break;
    case 'minute':
      if (value < 0 || value > 59) {
        return false;
      }
      break;
    case 'second':
      if (value < 0 || value > 59) {
        return false;
      }
      break;
    default:
      return false;
    // Invalid type
  }
  return true;
}
function modifyDate(date, type, value) {
  switch (type) {
    case 'year':
      return (0, _date.setYear)(date, value);
    case 'month':
      return (0, _date.setMonth)(date, value - 1);
    case 'day':
      return (0, _date.setDate)(date, value);
    case 'hour':
      return (0, _date.setHours)(date, value);
    case 'minute':
      return (0, _date.setMinutes)(date, value);
    case 'second':
      return (0, _date.setSeconds)(date, value);
  }
  return date;
}
function useInputSelection(input) {
  return function setSelectionRange(selectionStart, selectionEnd) {
    const isTest = input.current.dataset.test === 'true';
    if (isTest) {
      (0, _utils.safeSetSelection)(input.current, selectionStart, selectionEnd);
      return;
    }
    requestAnimationFrame(() => {
      (0, _utils.safeSetSelection)(input.current, selectionStart, selectionEnd);
    });
  };
}