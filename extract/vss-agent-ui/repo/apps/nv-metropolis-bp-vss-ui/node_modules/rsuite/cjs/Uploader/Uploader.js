'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.default = void 0;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _react = _interopRequireWildcard(require("react"));
var _find = _interopRequireDefault(require("lodash/find"));
var _UploadFileItem = _interopRequireDefault(require("./UploadFileItem"));
var _Plaintext = _interopRequireDefault(require("../internals/Plaintext"));
var _ajaxUpload = _interopRequireDefault(require("./utils/ajaxUpload"));
var _UploadTrigger = _interopRequireDefault(require("./UploadTrigger"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
// Define several states of the file during the upload process.

const getFiles = event => {
  if (typeof (event === null || event === void 0 ? void 0 : event['dataTransfer']) === 'object') {
    var _event$dataTransfer;
    return event === null || event === void 0 || (_event$dataTransfer = event['dataTransfer']) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.files;
  }
  if (event.target) {
    return event.target['files'];
  }
  return [];
};
const createFile = file => {
  const {
    fileKey
  } = file;
  return {
    ...file,
    fileKey: fileKey || (0, _utils.guid)(),
    progress: 0
  };
};
function fileListReducer(files, action) {
  var _action$files;
  switch (action.type) {
    // Add one or more files
    case 'push':
      return [...files, ...action.files];

    // Remove a file by `fileKey`
    case 'remove':
      return files.filter(f => f.fileKey !== action.fileKey);

    // Update a file
    case 'updateFile':
      return files.map(file => {
        return file.fileKey === action.file.fileKey ? action.file : file;
      });

    // Initialization file list
    case 'init':
      return ((_action$files = action.files) === null || _action$files === void 0 ? void 0 : _action$files.map(file => {
        // The state of the file needs to be preserved when the `fileList` is controlled.
        return files.find(f => f.fileKey === file.fileKey) || createFile(file);
      })) || [];
    default:
      throw new Error();
  }
}
const useFileList = (defaultFileList = []) => {
  const fileListRef = (0, _react.useRef)(defaultFileList.map(createFile));
  const fileListUpdateCallback = (0, _react.useRef)(null);
  const [fileList, dispatch] = (0, _react.useReducer)(fileListReducer, fileListRef.current);
  fileListRef.current = fileList;
  (0, _react.useEffect)(() => {
    var _fileListUpdateCallba;
    (_fileListUpdateCallba = fileListUpdateCallback.current) === null || _fileListUpdateCallba === void 0 || _fileListUpdateCallba.call(fileListUpdateCallback, fileList);
    fileListUpdateCallback.current = null;
  }, [fileList]);
  (0, _hooks.useWillUnmount)(() => {
    fileListUpdateCallback.current = null;
  });
  const dispatchCallback = (0, _react.useCallback)((action, callback) => {
    dispatch(action);
    fileListUpdateCallback.current = callback;
  }, []);
  return [fileListRef, dispatchCallback];
};

/**
 * The `Uploader` component is used to upload files.
 *
 * @see https://rsuitejs.com/components/uploader
 */
const Uploader = (0, _utils.forwardRef)((props, ref) => {
  const {
    propsWithDefaults
  } = (0, _hooks.useCustom)('Uploader', props);
  const {
    as,
    classPrefix = 'uploader',
    className,
    listType = 'text',
    defaultFileList,
    fileList: fileListProp,
    fileListVisible = true,
    locale,
    style,
    draggable,
    name = 'file',
    multiple = false,
    disabled = false,
    readOnly,
    plaintext,
    accept,
    children,
    toggleAs,
    removable = true,
    disabledFileItem,
    maxPreviewFileSize,
    method = 'POST',
    autoUpload = true,
    action,
    headers,
    withCredentials = false,
    disableMultipart,
    timeout = 0,
    data = {},
    onRemove,
    onUpload,
    shouldUpload,
    shouldQueueUpdate,
    renderFileInfo,
    renderThumbnail,
    onPreview,
    onChange,
    onSuccess,
    onError,
    onProgress,
    onReupload,
    ...rest
  } = propsWithDefaults;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const rootRef = (0, _react.useRef)(null);
  const xhrs = (0, _react.useRef)({});
  const trigger = (0, _react.useRef)(null);
  const [fileList, dispatch] = useFileList(fileListProp || defaultFileList);
  (0, _react.useEffect)(() => {
    if (typeof fileListProp !== 'undefined') {
      // Force reset fileList in reducer, when `fileListProp` is updated
      dispatch({
        type: 'init',
        files: fileListProp
      });
    }
  }, [dispatch, fileListProp]);
  const updateFileStatus = (0, _react.useCallback)(nextFile => {
    dispatch({
      type: 'updateFile',
      file: nextFile
    });
  }, [dispatch]);

  /**
   * Clear the value in input.
   */
  const cleanInputValue = (0, _react.useCallback)(() => {
    var _trigger$current;
    (_trigger$current = trigger.current) === null || _trigger$current === void 0 || _trigger$current.clearInput();
  }, []);

  /**
   * Callback for successful file upload.
   * @param file
   * @param response
   * @param event
   * @param xhr
   */
  const handleAjaxUploadSuccess = (0, _react.useCallback)((file, response, event, xhr) => {
    const nextFile = {
      ...file,
      status: 'finished',
      progress: 100
    };
    updateFileStatus(nextFile);
    onSuccess === null || onSuccess === void 0 || onSuccess(response, nextFile, event, xhr);
  }, [onSuccess, updateFileStatus]);

  /**
   * Callback for file upload error.
   * @param file
   * @param status
   * @param event
   * @param xhr
   */
  const handleAjaxUploadError = (0, _react.useCallback)((file, status, event, xhr) => {
    const nextFile = {
      ...file,
      status: 'error'
    };
    updateFileStatus(nextFile);
    onError === null || onError === void 0 || onError(status, nextFile, event, xhr);
  }, [onError, updateFileStatus]);

  /**
   * Callback for file upload progress update.
   * @param file
   * @param percent
   * @param event
   * @param xhr
   */
  const handleAjaxUploadProgress = (0, _react.useCallback)((file, percent, event, xhr) => {
    const nextFile = {
      ...file,
      status: 'uploading',
      progress: percent
    };
    updateFileStatus(nextFile);
    onProgress === null || onProgress === void 0 || onProgress(percent, nextFile, event, xhr);
  }, [onProgress, updateFileStatus]);

  /**
   * Upload a single file.
   * @param file
   */
  const handleUploadFile = (0, _hooks.useEventCallback)(file => {
    const {
      xhr,
      data: uploadData
    } = (0, _ajaxUpload.default)({
      name,
      timeout,
      headers,
      data,
      method,
      withCredentials,
      disableMultipart,
      file: file.blobFile,
      url: action,
      onError: handleAjaxUploadError.bind(null, file),
      onSuccess: handleAjaxUploadSuccess.bind(null, file),
      onProgress: handleAjaxUploadProgress.bind(null, file)
    });
    updateFileStatus({
      ...file,
      status: 'uploading'
    });
    if (file.fileKey) {
      xhrs.current[file.fileKey] = xhr;
    }
    onUpload === null || onUpload === void 0 || onUpload(file, uploadData, xhr);
  });
  const handleAjaxUpload = (0, _hooks.useEventCallback)(() => {
    fileList.current.forEach(file => {
      const checkState = shouldUpload === null || shouldUpload === void 0 ? void 0 : shouldUpload(file);
      if (checkState instanceof Promise) {
        checkState.then(res => {
          if (res) {
            handleUploadFile(file);
          }
        });
        return;
      } else if (checkState === false) {
        return;
      }
      if (file.status === 'inited') {
        handleUploadFile(file);
      }
    });
    cleanInputValue();
  });
  const handleUploadTriggerChange = (0, _hooks.useEventCallback)(event => {
    const files = getFiles(event);
    const newFileList = [];
    Array.from(files).forEach(file => {
      newFileList.push({
        blobFile: file,
        name: file.name,
        status: 'inited',
        fileKey: (0, _utils.guid)()
      });
    });
    const nextFileList = [...fileList.current, ...newFileList];
    const checkState = shouldQueueUpdate === null || shouldQueueUpdate === void 0 ? void 0 : shouldQueueUpdate(nextFileList, newFileList);
    if (checkState === false) {
      cleanInputValue();
      return;
    }
    const upload = () => {
      onChange === null || onChange === void 0 || onChange(nextFileList, event);
      if (rootRef.current) {
        dispatch({
          type: 'push',
          files: newFileList
        }, () => {
          autoUpload && handleAjaxUpload();
        });
      }
    };
    if (checkState instanceof Promise) {
      checkState.then(res => {
        res && upload();
      });
      return;
    }
    upload();
  });
  const handleRemoveFile = (0, _hooks.useEventCallback)((fileKey, event) => {
    var _xhrs$current;
    const file = (0, _find.default)(fileList.current, f => f.fileKey === fileKey);
    const nextFileList = fileList.current.filter(f => f.fileKey !== fileKey);
    if (((_xhrs$current = xhrs.current) === null || _xhrs$current === void 0 || (_xhrs$current = _xhrs$current[file.fileKey]) === null || _xhrs$current === void 0 ? void 0 : _xhrs$current.readyState) !== 4) {
      var _xhrs$current$file$fi;
      (_xhrs$current$file$fi = xhrs.current[file.fileKey]) === null || _xhrs$current$file$fi === void 0 || _xhrs$current$file$fi.abort();
    }
    dispatch({
      type: 'remove',
      fileKey
    });
    onRemove === null || onRemove === void 0 || onRemove(file);
    onChange === null || onChange === void 0 || onChange(nextFileList, event);
    cleanInputValue();
  });
  const handleReupload = (0, _hooks.useEventCallback)(file => {
    autoUpload && handleUploadFile(file);
    onReupload === null || onReupload === void 0 || onReupload(file);
  });

  // public API
  const start = (0, _react.useCallback)(file => {
    if (file) {
      handleUploadFile(file);
      return;
    }
    handleAjaxUpload();
  }, [handleAjaxUpload, handleUploadFile]);
  (0, _react.useImperativeHandle)(ref, () => ({
    root: rootRef.current,
    start
  }));
  const renderList = [/*#__PURE__*/_react.default.createElement(_UploadTrigger.default, (0, _extends2.default)({}, rest, {
    locale: locale,
    name: name,
    key: "trigger",
    multiple: multiple,
    draggable: draggable,
    disabled: disabled,
    readOnly: readOnly,
    accept: accept,
    ref: trigger,
    onChange: handleUploadTriggerChange,
    as: toggleAs
  }), children)];
  if (fileListVisible) {
    renderList.push(/*#__PURE__*/_react.default.createElement("div", {
      key: "items",
      className: prefix('file-items')
    }, fileList.current.map((file, index) => /*#__PURE__*/_react.default.createElement(_UploadFileItem.default, {
      locale: locale,
      key: file.fileKey || index,
      file: file,
      maxPreviewFileSize: maxPreviewFileSize,
      listType: listType,
      disabled: disabledFileItem,
      onPreview: onPreview,
      onReupload: handleReupload,
      onCancel: handleRemoveFile,
      renderFileInfo: renderFileInfo,
      renderThumbnail: renderThumbnail,
      removable: removable && !readOnly && !plaintext,
      allowReupload: !readOnly && !plaintext
    }))));
  }
  const dataAttributes = {
    'data-list-type': listType,
    'data-draggable': draggable
  };
  if (plaintext) {
    return /*#__PURE__*/_react.default.createElement(_Plaintext.default, (0, _extends2.default)({
      localeKey: "notUploaded",
      className: classes
    }, dataAttributes), fileList.current.length ? renderList[1] : null);
  }
  if (listType === 'picture') {
    renderList.reverse();
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, (0, _extends2.default)({
    as: as,
    ref: rootRef,
    className: classes,
    style: style
  }, dataAttributes), renderList);
});
Uploader.displayName = 'Uploader';
var _default = exports.default = Uploader;