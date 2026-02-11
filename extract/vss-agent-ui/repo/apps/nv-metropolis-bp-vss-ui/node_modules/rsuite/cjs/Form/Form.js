'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _FormControl = _interopRequireDefault(require("../FormControl"));
var _FormControlLabel = _interopRequireDefault(require("../FormControlLabel"));
var _FormErrorMessage = _interopRequireDefault(require("../FormErrorMessage"));
var _FormGroup = _interopRequireDefault(require("../FormGroup"));
var _FormHelpText = _interopRequireDefault(require("../FormHelpText"));
var _FormStack = _interopRequireDefault(require("../FormStack"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _useSchemaModel = _interopRequireDefault(require("./hooks/useSchemaModel"));
var _useFormValidate = _interopRequireDefault(require("./hooks/useFormValidate"));
var _useFormValue = _interopRequireDefault(require("./hooks/useFormValue"));
var _useFormRef = _interopRequireDefault(require("./hooks/useFormRef"));
var _utils = require("../internals/utils");
var _schemaTyped = require("schema-typed");
var _hooks = require("../internals/hooks");
var _FormContext = require("./FormContext");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const defaultSchema = (0, _schemaTyped.SchemaModel)({});
const Subcomponents = {
  Stack: _FormStack.default,
  Control: _FormControl.default,
  Label: _FormControlLabel.default,
  ErrorMessage: _FormErrorMessage.default,
  Group: _FormGroup.default,
  Text: _FormHelpText.default,
  /**
   * @deprecated Use `Form.Label` instead
   */
  ControlLabel: _FormControlLabel.default,
  /**
   * @deprecated Use `Form.Text` instead
   */
  HelpText: _FormHelpText.default
};

/**
 * The `Form` component is a form interface for collecting and validating user input.
 * @see https://rsuitejs.com/components/form
 */
const Form = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Form', props);
  const {
    checkTrigger = 'change',
    errorFromContext = true,
    formDefaultValue = {},
    formValue: controlledFormValue,
    formError: controlledFormError,
    nestedField = false,
    fluid,
    layout,
    model: formModel = defaultSchema,
    readOnly,
    plaintext,
    children,
    disabled,
    onSubmit,
    onReset,
    onCheck,
    onError,
    onChange,
    ...rest
  } = propsWithDefaults;
  const {
    getCombinedModel,
    pushFieldRule,
    removeFieldRule
  } = (0, _useSchemaModel.default)(formModel, nestedField);
  const {
    formValue,
    onRemoveValue,
    setFieldValue,
    resetFormValue
  } = (0, _useFormValue.default)(controlledFormValue, {
    formDefaultValue,
    nestedField
  });
  const formValidateProps = {
    formValue,
    getCombinedModel,
    onCheck,
    onError,
    nestedField
  };
  const {
    formError,
    onRemoveError,
    check,
    checkAsync,
    checkForField,
    checkFieldForNextValue,
    checkForFieldAsync,
    checkFieldAsyncForNextValue,
    cleanErrors,
    resetErrors,
    cleanErrorForField
  } = (0, _useFormValidate.default)(controlledFormError, formValidateProps);
  const submit = (0, _hooks.useEventCallback)(event => {
    // Check the form before submitting
    if (check()) {
      onSubmit === null || onSubmit === void 0 || onSubmit(formValue, event);
    }
  });
  const reset = (0, _hooks.useEventCallback)(event => {
    resetErrors();
    const resetValue = resetFormValue();
    if (resetValue) {
      onChange === null || onChange === void 0 || onChange(resetValue);
    }
    onReset === null || onReset === void 0 || onReset(resetValue, event);
  });
  const handleSubmit = (0, _hooks.useEventCallback)(event => {
    var _event$preventDefault, _event$stopPropagatio;
    event === null || event === void 0 || (_event$preventDefault = event.preventDefault) === null || _event$preventDefault === void 0 || _event$preventDefault.call(event);
    event === null || event === void 0 || (_event$stopPropagatio = event.stopPropagation) === null || _event$stopPropagatio === void 0 || _event$stopPropagatio.call(event);

    // Prevent submission when the form is disabled, readOnly, or plaintext
    if (disabled || readOnly || plaintext) {
      return;
    }
    submit(event);
  });
  const handleReset = (0, _hooks.useEventCallback)(event => {
    var _event$preventDefault2, _event$stopPropagatio2;
    event === null || event === void 0 || (_event$preventDefault2 = event.preventDefault) === null || _event$preventDefault2 === void 0 || _event$preventDefault2.call(event);
    event === null || event === void 0 || (_event$stopPropagatio2 = event.stopPropagation) === null || _event$stopPropagatio2 === void 0 || _event$stopPropagatio2.call(event);

    // Prevent reset when the form is disabled, readOnly, or plaintext
    if (disabled || readOnly || plaintext) {
      return;
    }
    reset(event);
  });
  const imperativeMethods = {
    check,
    checkForField,
    checkAsync,
    checkForFieldAsync,
    cleanErrors,
    cleanErrorForField,
    reset,
    resetErrors,
    submit
  };
  const formRef = (0, _useFormRef.default)(ref, {
    imperativeMethods
  });
  const removeFieldValue = (0, _hooks.useEventCallback)(name => {
    const formValue = onRemoveValue(name);
    onChange === null || onChange === void 0 || onChange(formValue);
  });
  const removeFieldError = (0, _hooks.useEventCallback)(name => {
    onRemoveError(name);
  });
  const onFieldChange = (0, _hooks.useEventCallback)((name, value, event) => {
    const nextFormValue = setFieldValue(name, value);
    onChange === null || onChange === void 0 || onChange(nextFormValue, event);
  });
  const formContextValue = {
    errorFromContext,
    checkTrigger,
    plaintext,
    readOnly,
    disabled,
    formError,
    nestedField,
    pushFieldRule,
    removeFieldValue,
    removeFieldError,
    removeFieldRule,
    onFieldChange,
    checkFieldForNextValue,
    checkFieldAsyncForNextValue
  };
  const formChild = (0, _react.useMemo)(() => {
    return fluid || layout ? /*#__PURE__*/_react.default.createElement(_FormStack.default, {
      fluid: fluid,
      layout: layout
    }, children) : children;
  }, [fluid, children, layout]);
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: "form",
    "data-rs": "form",
    "data-disabled": disabled,
    "data-readonly": readOnly,
    "data-plaintext": plaintext,
    ref: formRef,
    onSubmit: handleSubmit,
    onReset: handleReset
  }, rest), /*#__PURE__*/_react.default.createElement(_FormContext.FormProvider, {
    value: formContextValue
  }, /*#__PURE__*/_react.default.createElement(_FormContext.FormValueProvider, {
    value: formValue
  }, formChild)));
}, Subcomponents);
Form.displayName = 'Form';
var _default = exports.default = Form;