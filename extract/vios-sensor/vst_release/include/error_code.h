/*
 * SPDX-FileCopyrightText: Copyright (c) 2020-2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

#pragma once

#include <iostream>
#include <utility>


#define EMPTY_STRING ""
#define UNKNOWN_STRING "unknown"
#define CAMERA_STATE_ONLINE "online"
#define CAMERA_STATE_OFFLINE "offline"
#define CAMERA_COMMUNICATION_ERROR_MSG "Device communication failed"
#define CAMERA_CAMERA_NOT_FOUND_MSG "Device Not Found"
#define CAMERA_CAMERA_REQUEST_TIMEOUT_MSG "Device request timeout"
#define CAMERA_CAMERA_NOT_FOUND_CODE 404
#define CAMERA_CAMERA_REQUEST_TIMEOUT 408
#define CAMERA_NO_ERROR_MSG "No Error"
#define CAMERA_NO_ERROR_CODE 200
#define UNDERSCORE_STR "_"
#define UNDERSCORE_CHAR '_'
#define HYPHEN_CHAR '-'
#define WHITESPACE_CHAR ' '

#define FATAL_ERROR_CODE -100


#define SET_VMS_ERROR(err_code, value) { std::pair<string, string> err = getCameraErrorCodeString(err_code); \
                                        value["error_code"] = err.first; \
                                        value["error_message"] = err.second; }

#define SET_VMS_ERROR2(err_code, value, message) { std::pair<string, string> err = getCameraErrorCodeString(err_code); \
                                        value["error_code"] = err.first; \
                                        string msg(message); \
                                        if (msg.empty()) {value["error_message"] = err.second;} else {value["error_message"] = msg;} }


#define CHECK_JSON_OBJECT_IF_ERROR_RETURN(json_obj) {\
                                        if (!json_obj.isObject() ||  json_obj.empty()) { \
                                            LOG(error) << "Invalid Parameter" << endl; \
                                            SET_VMS_ERROR(VmsErrorCode::InvalidParameterError, response) \
                                            return VmsErrorCode::InvalidParameterError; } }
namespace nv_vms
{
    enum VmsErrorCode
    {
        NoError = 0,
        CameraUnauthorizedError = 0x1F,  // HTTP error code : 403
        ClientUnauthorizedError,         // HTTP error code : 401
        InvalidParameterError,           // HTTP error code : 400
        CameraNotFoundError,             // HTTP error code : 404
        MethodNotAllowedError,           // HTTP error code : 405
        DeviceRequestTimeoutError,       // HTTP error code : 408
        CommunicationError,              // HTTP error code : 500
        VMSInternalError,                // HTTP error code : 500
        VMSNotSupportedError,            // HTTP error code : 501
        VMSInsufficientStorage,          // HTTP error code : 507
        VMSNoDataError,                  // HTTP error code : 404 (no streams/data found for given time range)
        ResourceConflictError,           // HTTP error code : 409
        PayloadTooLargeError,            // HTTP error code : 413
        UnsupportedMediaTypeError,       // HTTP error code : 415
        UnprocessableEntityError,        // HTTP error code : 422
        TooManyRequestsError,            // HTTP error code : 429
        ServiceUnavailableError,         // HTTP error code : 503
    };

    enum SensorStatusEvent
    {
        SensorStatusOffline = 0,
        SensorStatusOnline = 1,
        SensorStatusStreaming = 2,
        SensorStatusProxy = 3,
        SensorStatusUnknown = 0xFFF
    };

    enum StreamStatus
    {
        STREAM_STATUS_UNKNOWN = -1,
        STREAM_STATUS_ONLINE,
        STREAM_STATUS_OFFLINE,
        STREAM_STATUS_STREAMING,
        STREAM_STATUS_PROXY
    };
} // nv_vms