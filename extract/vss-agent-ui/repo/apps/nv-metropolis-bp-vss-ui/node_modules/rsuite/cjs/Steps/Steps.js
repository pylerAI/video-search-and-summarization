'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _StepItem = _interopRequireDefault(require("./StepItem"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const Subcomponents = {
  Item: _StepItem.default
};

/**
 * The `Steps` component is used to guide users to complete tasks in accordance with the process.
 *
 * @see https://rsuitejs.com/components/steps
 */
const Steps = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Steps', props);
  const {
    as,
    classPrefix = 'steps',
    className,
    children,
    vertical,
    small,
    current = 0,
    currentStatus = 'process',
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const items = (0, _react.useMemo)(() => {
    const count = _utils.rch.count(children);
    return _utils.rch.mapCloneElement(children, (item, index) => {
      const itemStyles = {
        flexBasis: index < count - 1 ? `${100 / (count - 1)}%` : undefined,
        maxWidth: index === count - 1 ? `${100 / count}%` : undefined
      };
      const itemProps = {
        stepNumber: index + 1,
        status: 'wait',
        style: !vertical ? itemStyles : undefined,
        ...item.props
      };

      // fix tail color
      if (currentStatus === 'error' && index === current - 1) {
        itemProps['data-next-error'] = true;
      }
      if (!item.props.status) {
        if (index === current) {
          itemProps.status = currentStatus;
        } else if (index < current) {
          itemProps.status = 'finish';
        }
      }
      return itemProps;
    });
  }, [children, current, currentStatus, vertical]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: ref,
    className: classes,
    "data-size": small ? 'small' : undefined,
    "data-direction": vertical ? 'vertical' : 'horizontal'
  }, rest), items);
}, Subcomponents);
Steps.displayName = 'Steps';
var _default = exports.default = Steps;