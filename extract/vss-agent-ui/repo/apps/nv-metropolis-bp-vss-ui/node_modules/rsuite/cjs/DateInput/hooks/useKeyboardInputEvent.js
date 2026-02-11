'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
exports.useKeyboardInputEvent = useKeyboardInputEvent;
function useKeyboardInputEvent({
  onSegmentChange,
  onSegmentValueChange,
  onSegmentValueChangeWithNumericKeys,
  onSegmentValueRemove,
  onAmPmToggle,
  onKeyDown
}) {
  return event => {
    var _key$match, _key$match2;
    const key = event.key;
    switch (key) {
      case 'ArrowRight':
      case 'ArrowLeft':
        onSegmentChange === null || onSegmentChange === void 0 || onSegmentChange(event);
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        onSegmentValueChange === null || onSegmentValueChange === void 0 || onSegmentValueChange(event);
        event.preventDefault();
        break;
      case 'Backspace':
        onSegmentValueRemove === null || onSegmentValueRemove === void 0 || onSegmentValueRemove(event);
        event.preventDefault();
        break;
      case (_key$match = key.match(/\d/)) === null || _key$match === void 0 ? void 0 : _key$match.input:
        // Allow numeric keys to be entered
        onSegmentValueChangeWithNumericKeys === null || onSegmentValueChangeWithNumericKeys === void 0 || onSegmentValueChangeWithNumericKeys(event);
        event.preventDefault();
        break;
      case 'a':
      case 'p':
      case 'A':
      case 'P':
        // Determine whether the Ctrl or Command key is pressed, does not affect user copy and paste
        if (event.ctrlKey || event.metaKey) {
          break;
        }

        // Handle AM/PM toggle with 'a' or 'p' keys
        onAmPmToggle === null || onAmPmToggle === void 0 || onAmPmToggle(event);
        event.preventDefault();
        break;
      case (_key$match2 = key.match(/[a-z]/)) === null || _key$match2 === void 0 ? void 0 : _key$match2[0]:
        // Determine whether the Ctrl or Command key is pressed, does not affect user copy and paste
        if (event.ctrlKey || event.metaKey) {
          break;
        }

        // Prevent letters from being entered
        event.preventDefault();
        break;
    }
    onKeyDown === null || onKeyDown === void 0 || onKeyDown(event);
  };
}
var _default = exports.default = useKeyboardInputEvent;