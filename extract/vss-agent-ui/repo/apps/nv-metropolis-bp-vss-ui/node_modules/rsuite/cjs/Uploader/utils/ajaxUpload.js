'use client';
"use strict";

exports.__esModule = true;
exports.default = ajaxUpload;
function getResponse(xhr) {
  const text = xhr.responseText || xhr.response;
  if (!text) {
    return text;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
function ajaxUpload(options) {
  const {
    name,
    timeout,
    headers = {},
    data = {},
    method = 'POST',
    onError,
    onSuccess,
    onProgress,
    file,
    url,
    withCredentials,
    disableMultipart
  } = options;
  const xhr = new XMLHttpRequest();
  let sendableData;
  xhr.open(method, url, true);
  if (!disableMultipart) {
    sendableData = new FormData();
    sendableData.append(name, file, file.name);
    for (const key in data) {
      sendableData.append(key, data[key]);
    }
  } else {
    sendableData = file;
  }
  Object.keys(headers).forEach(key => {
    if (headers[key] !== null) {
      xhr.setRequestHeader(key, headers[key]);
    }
  });
  if (headers['X-Requested-With'] !== null) {
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  }
  if (timeout) {
    xhr.timeout = timeout;
    xhr.ontimeout = event => {
      onError === null || onError === void 0 || onError({
        type: 'timeout'
      }, event, xhr);
    };
  }
  if (withCredentials && 'withCredentials' in xhr) {
    xhr.withCredentials = true;
  }
  xhr.onload = event => {
    const resp = getResponse(xhr);
    if (xhr.status < 200 || xhr.status >= 300) {
      onError === null || onError === void 0 || onError({
        type: 'server_error',
        response: resp
      }, event, xhr);
      return;
    }
    onSuccess === null || onSuccess === void 0 || onSuccess(resp, event, xhr);
  };
  if (xhr.upload) {
    xhr.upload.onprogress = event => {
      let percent = 0;
      if (event.lengthComputable) {
        percent = event.loaded / event.total * 100;
      }
      onProgress === null || onProgress === void 0 || onProgress(percent, event, xhr);
    };
  }
  xhr.onerror = event => {
    onError === null || onError === void 0 || onError({
      type: 'xhr_error'
    }, event, xhr);
  };
  xhr.send(sendableData);
  return {
    xhr,
    data: sendableData
  };
}