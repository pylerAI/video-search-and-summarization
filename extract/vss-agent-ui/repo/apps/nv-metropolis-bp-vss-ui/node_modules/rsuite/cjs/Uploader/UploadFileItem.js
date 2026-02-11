'use client';
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
exports.__esModule = true;
exports.formatSize = exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _Attachment = _interopRequireDefault(require("@rsuite/icons/Attachment"));
var _Reload = _interopRequireDefault(require("@rsuite/icons/Reload"));
var _CloseButton = _interopRequireDefault(require("../internals/CloseButton"));
var _Box = _interopRequireDefault(require("../internals/Box"));
var _utils = require("../internals/utils");
var _hooks = require("../internals/hooks");
var _previewFile = require("./utils/previewFile");
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
/**
 * Format display file size
 * @param size
 */
const formatSize = (size = 0) => {
  const K = 1024;
  const M = 1024 * 1024;
  const G = 1024 * 1024 * 1024;
  if (size > G) {
    return `${(size / G).toFixed(2)}GB`;
  }
  if (size > M) {
    return `${(size / M).toFixed(2)}MB`;
  }
  if (size > K) {
    return `${(size / K).toFixed(2)}KB`;
  }
  return `${size}B`;
};
exports.formatSize = formatSize;
const UploadFileItem = (0, _utils.forwardRef)((props, ref) => {
  const {
    as,
    disabled,
    allowReupload = true,
    file,
    classPrefix = 'uploader-file-item',
    listType = 'text',
    className,
    removable = true,
    maxPreviewFileSize = 1024 * 1024 * 5,
    // 5MB
    locale,
    renderFileInfo,
    renderThumbnail,
    onPreview,
    onCancel,
    onReupload,
    ...rest
  } = props;
  const {
    merge,
    withPrefix,
    prefix
  } = (0, _hooks.useStyles)(classPrefix);
  const classes = merge(className, withPrefix());
  const dataAttributes = {
    'data-type': listType,
    'data-disabled': disabled,
    'data-has-error': file.status === 'error'
  };
  const [previewImage, setPreviewImage] = (0, _react.useState)(file.url ? file.url : null);

  /**
   * Get thumbnail of image file
   */
  const getThumbnail = (0, _react.useCallback)(callback => {
    var _file$blobFile;
    if (!~['picture-text', 'picture'].indexOf(listType)) {
      return;
    }

    // The thumbnail file size cannot be larger than the preset value.
    if (!file.blobFile || (file === null || file === void 0 || (_file$blobFile = file.blobFile) === null || _file$blobFile === void 0 ? void 0 : _file$blobFile.size) > maxPreviewFileSize) {
      return;
    }
    (0, _previewFile.previewFile)(file.blobFile, callback);
  }, [file, listType, maxPreviewFileSize]);
  (0, _react.useEffect)(() => {
    if (!file.url) {
      getThumbnail(previewImage => {
        setPreviewImage(previewImage);
      });
    }
  }, [file.url, getThumbnail]);
  const handlePreview = (0, _react.useCallback)(event => {
    if (disabled) {
      return;
    }
    onPreview === null || onPreview === void 0 || onPreview(file, event);
  }, [disabled, file, onPreview]);
  const handleRemove = (0, _react.useCallback)(event => {
    if (disabled) {
      return;
    }
    onCancel === null || onCancel === void 0 || onCancel(file.fileKey, event);
  }, [disabled, file.fileKey, onCancel]);
  const handleReupload = (0, _react.useCallback)(event => {
    if (disabled) {
      return;
    }
    onReupload === null || onReupload === void 0 || onReupload(file, event);
  }, [disabled, file, onReupload]);

  /**
   * Rendering progress bar
   */
  const renderProgressBar = () => {
    const {
      progress = 0,
      status
    } = file;
    const show = !disabled && status === 'uploading';
    const visibility = show ? 'visible' : 'hidden';
    const wrapStyle = {
      visibility
    };
    const progressbarStyle = {
      width: `${progress}%`
    };
    return /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('progress'),
      style: wrapStyle
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('progress-bar'),
      style: progressbarStyle
    }));
  };
  const renderPreview = () => {
    const thumbnail = previewImage ? /*#__PURE__*/_react.default.createElement("img", {
      role: "presentation",
      src: previewImage,
      alt: file.name,
      onClick: handlePreview,
      "aria-label": `Preview: ${file.name}`
    }) : /*#__PURE__*/_react.default.createElement(_Attachment.default, {
      className: prefix('icon')
    });
    return /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('preview')
    }, renderThumbnail ? renderThumbnail(file, thumbnail) : thumbnail);
  };

  /**
   * Render the loading state.
   */
  const renderIcon = () => {
    const uploading = file.status === 'uploading';
    const classes = prefix('icon-wrapper', {
      'icon-loading': uploading
    });
    if (uploading) {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: classes
      }, /*#__PURE__*/_react.default.createElement("i", {
        className: prefix('icon'),
        "aria-label": "Uploading"
      }));
    }
    if (listType === 'picture' || listType === 'picture-text') {
      return null;
    }
    return /*#__PURE__*/_react.default.createElement("div", {
      className: classes
    }, /*#__PURE__*/_react.default.createElement(_Attachment.default, {
      className: prefix('icon')
    }));
  };

  /**
   * Render the remove file button.
   */
  const renderRemoveButton = () => {
    if (!removable) {
      return null;
    }
    let closeLabel = 'Remove file';
    if (locale !== null && locale !== void 0 && locale.removeFile) {
      closeLabel = (locale === null || locale === void 0 ? void 0 : locale.removeFile) + (file !== null && file !== void 0 && file.name ? `: ${file === null || file === void 0 ? void 0 : file.name}` : '');
    }
    return /*#__PURE__*/_react.default.createElement(_CloseButton.default, {
      className: prefix('btn-remove'),
      onClick: handleRemove,
      tabIndex: -1,
      locale: {
        closeLabel
      },
      "aria-hidden": disabled
    });
  };

  /**
   * Render error messages.
   */
  const renderErrorStatus = () => {
    if (file.status === 'error') {
      return /*#__PURE__*/_react.default.createElement("div", {
        className: prefix('status')
      }, /*#__PURE__*/_react.default.createElement("span", null, locale === null || locale === void 0 ? void 0 : locale.error), allowReupload && /*#__PURE__*/_react.default.createElement("a", {
        role: "button",
        tabIndex: -1,
        onClick: handleReupload,
        "aria-label": "Retry"
      }, /*#__PURE__*/_react.default.createElement(_Reload.default, {
        className: prefix('icon-reupload')
      })));
    }
    return null;
  };

  /**
   * Render file size.
   */
  const renderFileSize = () => {
    if (file.status !== 'error' && file.blobFile) {
      var _file$blobFile2;
      return /*#__PURE__*/_react.default.createElement("span", {
        className: prefix('size')
      }, formatSize(file === null || file === void 0 || (_file$blobFile2 = file.blobFile) === null || _file$blobFile2 === void 0 ? void 0 : _file$blobFile2.size));
    }
    return null;
  };

  /**
   * Render file panel
   */
  const renderFilePanel = () => {
    const fileElement = /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('title'),
      tabIndex: -1,
      onClick: handlePreview,
      "aria-label": `Preview: ${file.name}`
    }, file.name);
    return /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('panel')
    }, /*#__PURE__*/_react.default.createElement("div", {
      className: prefix('content')
    }, renderFileInfo ? renderFileInfo(file, fileElement) : fileElement, renderErrorStatus(), renderFileSize()));
  };
  const boxProps = {
    as,
    ref,
    className: classes,
    ...dataAttributes,
    ...rest
  };
  if (listType === 'picture') {
    return /*#__PURE__*/_react.default.createElement(_Box.default, boxProps, renderIcon(), renderPreview(), renderErrorStatus(), renderRemoveButton());
  }
  if (listType === 'picture-text') {
    return /*#__PURE__*/_react.default.createElement(_Box.default, boxProps, renderIcon(), renderPreview(), renderFilePanel(), renderProgressBar(), renderRemoveButton());
  }
  return /*#__PURE__*/_react.default.createElement(_Box.default, boxProps, renderIcon(), renderFilePanel(), renderProgressBar(), renderRemoveButton());
});
UploadFileItem.displayName = 'UploadFileItem';
var _default = exports.default = UploadFileItem;