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

set -Ee

function check_vst_running() {
VST_STATUS=`curl -s -o /dev/null -w "%{http_code}" localhost:30000`
 echo $VST_STATUS
  if [[ $VST_STATUS != '200' ]]; then
	  echo "VST is not running, Please make sure VST is installed to be collect the data"
	  exit 1

  else
      echo "VST is Running and is healthy..."
  fi
}

function import_vst_data() {
sudo apt-get update && sudo apt-get install jq -y
IMPORT_VST_DATA_LOCAL_PATH=`docker inspect mdx-vst | jq -r .[].GraphDriver.Data.MergedDir`
if [[ $IMPORT_VST_DATA_LOCAL_PATH == '' && $VST_DATA_STORE_LOCAL_PATH == '' ]]; then
	echo "#######    VST Volume is not found for Importing the VST DATA... VST_DATA_LOCAL_PATH = $IMPORT_VST_DATA_LOCAL_PATH can be found from docker inspect command....  #######"
	exit 0

else
    echo "Importing VST Data for MDX LLM App Testing, VST DATA file will be stored at PATH = $VST_DATA_STORE_LOCAL_PATH for data from PATH = $IMPORT_VST_DATA_LOCAL_PATH"
    sudo docker cp $VST_DATA_STORE_LOCAL_PATH/vst_data mdx-vst:/home/vst/vst_release
    sudo docker cp $VST_DATA_STORE_LOCAL_PATH/vst_video mdx-vst:/home/vst/vst_release
    sudo docker restart mdx-vst
fi
}

check_vst_running
import_vst_data
