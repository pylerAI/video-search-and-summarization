'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _ListContext = _interopRequireDefault(require("./ListContext"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * The `List.Item` component is used to specify the layout of the list item.
 * @see https://rsuitejs.com/components/list
 */
const ListItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    children,
    className,
    classPrefix = 'list-item',
    collection = 0,
    disabled,
    index,
    size: sizeProp,
    ...rest
  } = props;
  const {
    bordered,
    register,
    size: parentSize
  } = (0, _react.useContext)(_ListContext.default);
  const size = sizeProp || parentSize;
  const {
    withPrefix,
    merge
  } = (0, _hooks.useStyles)(classPrefix);
  const listItemRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    if (listItemRef.current) {
      const {
        unregister
      } = register({
        node: listItemRef.current,
        edgeOffset: null,
        info: {
          collection,
          disabled,
          index
        }
      });
      return unregister;
    }
  }, [collection, disabled, index, register]);
  const classes = merge(className, withPrefix());
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    role: "listitem",
    "aria-disabled": disabled,
    "data-size": size,
    "data-disabled": disabled,
    "data-bordered": bordered,
    ref: (0, _utils.mergeRefs)(listItemRef, ref),
    className: classes
  }, rest), children);
});
ListItem.displayName = 'ListItem';
var _default = exports.default = ListItem;