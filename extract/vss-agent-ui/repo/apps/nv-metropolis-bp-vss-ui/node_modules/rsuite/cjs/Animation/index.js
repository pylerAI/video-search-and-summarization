'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = exports.Animation = void 0;
var _Transition = _interopRequireDefault(require("./Transition"));
exports.Transition = _Transition.default;
var _Slide = _interopRequireDefault(require("./Slide"));
exports.Slide = _Slide.default;
var _Collapse = _interopRequireDefault(require("./Collapse"));
exports.Collapse = _Collapse.default;
var _Fade = _interopRequireDefault(require("./Fade"));
exports.Fade = _Fade.default;
var _Bounce = _interopRequireDefault(require("./Bounce"));
exports.Bounce = _Bounce.default;
// export types

// export components
const Animation = exports.Animation = {
  Transition: _Transition.default,
  Collapse: _Collapse.default,
  Fade: _Fade.default,
  Bounce: _Bounce.default,
  Slide: _Slide.default
};
var _default = exports.default = Animation;