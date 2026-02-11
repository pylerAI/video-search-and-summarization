'use client';
"use strict";

exports.__esModule = true;
exports.default = void 0;
var _ToastContainer = _interopRequireWildcard(require("./ToastContainer"));
var _symbols = require("../internals/symbols");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const containers = new Map();

/**
 * Create a container instance.
 * @param placement
 * @param props
 */
async function createContainer(placement, props) {
  const [container, containerId] = await _ToastContainer.default.getInstance(props);
  containers.set(`${containerId}_${placement}`, container);
  return container;
}

/**
 * Get the container by ID. Use default ID when ID is not available.
 * @param containerId
 * @param placement
 */
function getContainer(containerId, placement) {
  return containers.get(`${containerId}_${placement}`);
}
const toaster = message => toaster.push(message);
toaster.push = (message, options = {}) => {
  const {
    placement = 'topCenter',
    container = _ToastContainer.defaultToasterContainer,
    ...restOptions
  } = options;
  const containerElement = typeof container === 'function' ? container() : container;
  const containerElementId = containerElement ? containerElement[_symbols.RSUITE_TOASTER_ID] : null;
  if (containerElementId) {
    const existedContainer = getContainer(containerElementId, placement);
    if (existedContainer) {
      var _existedContainer$cur;
      return (_existedContainer$cur = existedContainer.current) === null || _existedContainer$cur === void 0 ? void 0 : _existedContainer$cur.push(message, restOptions);
    }
  }
  const newOptions = {
    ...options,
    container: containerElement,
    placement
  };
  return createContainer(placement, newOptions).then(ref => {
    var _ref$current;
    return (_ref$current = ref.current) === null || _ref$current === void 0 ? void 0 : _ref$current.push(message, restOptions);
  });
};
toaster.remove = key => {
  containers.forEach(c => {
    var _c$current;
    return (_c$current = c.current) === null || _c$current === void 0 ? void 0 : _c$current.remove(key);
  });
};
toaster.clear = () => {
  containers.forEach(c => {
    var _c$current2;
    return (_c$current2 = c.current) === null || _c$current2 === void 0 ? void 0 : _c$current2.clear();
  });
};
var _default = exports.default = toaster;