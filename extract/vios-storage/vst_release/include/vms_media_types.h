/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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

#include <cstdint>
#include <string>
#include <vector>

namespace nv_vms {

enum class ImageFormat { JPEG };
enum class VideoCodec { H264, H265 };
// Avoid macro collisions with common defines like MP4/MKV by using camel-case names
enum class ContainerFormat { Mp4, Mkv };

struct ConnectionParams
{
    std::string ip;
    std::string user;
    std::string password;
    uint16_t    port{0};
    std::string url; // optional
};

struct Capabilities
{
    std::vector<ImageFormat>    image_formats;
    std::vector<VideoCodec>     video_codecs;
    std::vector<ContainerFormat> containers;
};

struct SnapshotRequest
{
    std::string camera_id;
    ImageFormat format{ImageFormat::JPEG};
    uint32_t    width{0};   // 0 = original
    uint32_t    height{0};  // 0 = original
    uint64_t    ts_ms{0};   // 0 = now
};

struct SnapshotResponse
{
    std::vector<uint8_t> bytes; // encoded JPEG
    ImageFormat          format{ImageFormat::JPEG};
};

struct ClipRequest
{
    std::string     camera_id;
    uint64_t        start_ms{0};
    uint64_t        end_ms{0};
    VideoCodec      codec{VideoCodec::H265};
    ContainerFormat container{ContainerFormat::Mp4};
    int32_t         frame_rate{1};
};

struct ClipResponse
{
    // Return path to a produced file for simplicity
    std::string file_path;
};

constexpr int MEDIA_OK                    = 0;
constexpr int MEDIA_ERR_NOT_SUPPORTED     = -1;
constexpr int MEDIA_ERR_INVALID_ARGUMENT  = -2;
constexpr int MEDIA_ERR_CONNECTION        = -3;
constexpr int MEDIA_ERR_IO                = -4;

} // namespace nv_vms


