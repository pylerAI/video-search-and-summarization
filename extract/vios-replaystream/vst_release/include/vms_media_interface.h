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

#include <string>
#include "vms_media_types.h"

namespace nv_vms {

class IMediaInterface
{
public:
    virtual ~IMediaInterface() = default;

    virtual int  connect(const ConnectionParams& conn) = 0;
    virtual bool isServerOnline(const std::string& url) = 0;
    virtual Capabilities getCapabilities() const = 0;

    virtual int fetchSnapshot(const SnapshotRequest& req, SnapshotResponse& out) = 0;
    virtual int fetchClip(const ClipRequest& req, ClipResponse& out) = 0;

    virtual void close() {}
};

extern "C" IMediaInterface* createMediaObject();
extern "C" void destroyMediaObject(IMediaInterface* object);

typedef IMediaInterface* (*createMediaObject_t)(void);
typedef void (*destroyMediaObject_t)(IMediaInterface*);

} // namespace nv_vms


