/*
 * SPDX-FileCopyrightText: Copyright (c) 2023-2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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

#include "device_manager.h"

#include<iostream>
#include<vector>
#include<memory>

using namespace std; 

static const string HTTP  = "http";
static const string HTTPS = "https";
static const string RTSP  = "rtsp";

namespace nv_vms
{

struct AdaptorInfo
{
    AdaptorInfo(): m_id("")
                 , m_name("")
                 , m_type("")
                 , m_user ("")
                 , m_password ("")
                 , m_port("")
                 , m_ipaddress("")
                 , m_url("")
    {}
    AdaptorInfo(const AdaptorInfo& obj)
    {
        this->m_id = obj.m_id;
        this->m_name = obj.m_name;
        this->m_type = obj.m_type;
        this->m_user = obj.m_user;
        this->m_password = obj.m_password;
        this->m_port = obj.m_port;
        this->m_ipaddress = obj.m_ipaddress;
        this->m_url = obj.m_url;
    }
    void operator=(const AdaptorInfo& obj)
    {
        this->m_id = obj.m_id;
        this->m_name = obj.m_name;
        this->m_type = obj.m_type;
        this->m_user = obj.m_user;
        this->m_password = obj.m_password;
        this->m_port = obj.m_port;
        this->m_ipaddress = obj.m_ipaddress;
        this->m_url = obj.m_url;
    }
    string m_id;
    string m_name;
    string m_type;
    string m_user;
    string m_password;
    string m_port;
    string m_ipaddress;
    string m_url;
};

class ISensorControlInterface
{
public:
    virtual int connect() = 0;
    virtual int getSensorStreamInfo(vector<shared_ptr<SensorInfo>>& sensors) = 0;
    virtual int getSensorStreamInfo(shared_ptr<SensorInfo>& sensor) = 0;
    virtual int synchronizeSensorTime(shared_ptr<SensorInfo>& sensor) { return -1; };
    virtual int getSensorStatus(const string& cameraId, SensorStatus& status) { return -1; };
    virtual int getSensorStatus(const vector<string>& camera_ids, vector<SensorStatus>& status) { return -1; };
    virtual int rebootSensor(shared_ptr<SensorInfo>& sensor) { return -1; };
    virtual bool isServerOnline(const string & url) = 0;
    virtual int getSensorImageSettings(shared_ptr<SensorInfo>& sensor, const string& stream_id, SensorSettings& settings) { return -1; };
    virtual int setSensorImageSettings(shared_ptr<SensorInfo>& sensor, const SensorImageSettingsValues& settings) { return -1; };
    virtual int getNetworkInfo(shared_ptr<SensorInfo>& sensor, SensorNetworkInfo& networkInfo) { return -1; };
    virtual int setNetworkInfo(shared_ptr<SensorInfo>& sensor, const SensorNetworkInfo& networkInfo, bool& rebootNeeded) { return -1; };
    virtual int getSensorEncodeSettings(shared_ptr<SensorInfo>& sensor, const string& stream_id, SensorSettings& settings) { return -1; };
    virtual int setSensorEncodeSettings(shared_ptr<SensorInfo>& sensor, const SensorVideoEncoderSettingsValues& settings) { return -1; };
    virtual int getStreamSettings(shared_ptr<SensorInfo>& sensor, const string& stream_id) { return 0;}
    virtual int setPTZ(shared_ptr<SensorInfo>& sensor, PTZAction, string x, string y) { return 0; };
    map<PTZAction, ptzRange> getPTZ(shared_ptr<SensorInfo>& sensor) { map<PTZAction, ptzRange>ptz; return ptz; };
    virtual bool validateCredentials(shared_ptr<SensorInfo>& sensor, const string username, const string password) { return false; }
    virtual VmsErrorCode addSensor(const Json::Value& sensorInfo) { return VmsErrorCode::NoError; }
    virtual bool deleteSensor(shared_ptr<SensorInfo>& sensor) { return true; }
    virtual int setSensorInfo(shared_ptr<SensorInfo> &sensor) { return 0; }
    virtual int getRecordingTimelines(shared_ptr<SensorInfo>& sensor, Json::Value& timelinesJson) { return -1; }

    void setAdaptorInfo(AdaptorInfo& info) { m_adaptorInfo = info; }
    void setCacheSensorList(std::vector<shared_ptr<SensorInfo>> list) { m_cacheSensorList = list; }
    std::vector<shared_ptr<SensorInfo>> getCacheSensorList() { return m_cacheSensorList; }
protected:
    AdaptorInfo m_adaptorInfo;
    std::vector<shared_ptr<SensorInfo>> m_cacheSensorList;
};

ISensorControlInterface* createObject();
void destroyObject(ISensorControlInterface* object);

typedef ISensorControlInterface* (*createControlObject_t) (void);
typedef void (*destroyControlObject_t) (ISensorControlInterface*);

} //nv_vms