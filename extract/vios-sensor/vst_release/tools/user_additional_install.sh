#!/bin/bash

# SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: MIT
#
# Permission is hereby granted, free of charge, to any person obtaining a
# copy of this software and associated documentation files (the "Software"),
# to deal in the Software without restriction, including without limitation
# the rights to use, copy, modify, merge, publish, distribute, sublicense,
# and/or sell copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in
# all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
# THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
# DEALINGS IN THE SOFTWARE

set -e  # Exit on any error

. /etc/os-release
UBUNTU_VERSION="$VERSION_ID"

apt-get update

if [[ "$UBUNTU_VERSION" == "22.04" ]]; then
    apt-get install -y gstreamer1.0-libav
    apt-get install --reinstall -y gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
        libvo-aacenc0 libfaad2 libswresample-dev libavutil-dev libavutil56 libavcodec-dev libavcodec58 libavformat-dev \
        libavformat58 libavfilter7 libde265-dev libde265-0 libx265-199 libx264-163 libvpx7 libmpeg2encpp-2.1-0 libmpeg2-4 libmpg123-0 libopenh264-6 \
        libbs2b0 libreadline8 libcdio19 libdca0 libdvdnav4 libmjpegutils-2.1-0 liba52-0.7.4 libdvdread8 libsbc1 libzvbi0 libmp3lame0 libsidplay1v5 \
        liblrdf0 libneon27
    apt-get install --reinstall -y libflac8 libxvidcore4
    # Install libvpx9 if available for storage management dependency (fallback for version 9)
    apt-get install --reinstall -y libvpx9 2>/dev/null || echo "libvpx9 not available on Ubuntu 22.04, using libvpx7"
elif [[ "$UBUNTU_VERSION" == "24.04" ]]; then
    apt-get install -y gstreamer1.0-libav
    apt-get install --reinstall -y gstreamer1.0-plugins-good gstreamer1.0-plugins-bad gstreamer1.0-plugins-ugly \
        libvo-aacenc0 libfaad2 libswresample-dev libswresample4 libavutil-dev libavutil58 libavcodec-dev libavcodec60 \
        libavformat-dev libavformat60 libavfilter-dev libavfilter9 libde265-dev libde265-0 libx265-199 libx264-164 \
        libmpeg2encpp-2.1-0 libmpeg2-4 libmpg123-0 libbs2b0 libreadline8 libcdio19 libdca0 libdvdnav4 \
        libmjpegutils-2.1-0 liba52-0.7.4 libdvdread8 libsbc1 libzvbi0 libmp3lame0 libsidplay1v5 liblrdf0 libneon27
    apt-get install --reinstall -y libflac12 libxvidcore4
    # Install libvpx for storage management dependency
    apt-get install --reinstall -y libvpx9 libopenh264-7
else
    echo "Unsupported Ubuntu version: $UBUNTU_VERSION"
    exit 1
fi

rm -rf ~/.cache/gstreamer-1.0/

echo "Installation completed successfully!"