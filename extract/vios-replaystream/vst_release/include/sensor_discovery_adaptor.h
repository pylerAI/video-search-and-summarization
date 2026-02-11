/*
 * SPDX-FileCopyrightText: Copyright (c) 2022-2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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
#include <vector>
#include <memory>
#include <algorithm>

#include "device_manager.h"

namespace nv_vms {

class ISensorDiscoveryEvent
{
    public:
        ISensorDiscoveryEvent() {}
        virtual ~ISensorDiscoveryEvent() {}

        virtual int onSensorFound(SensorInfo& sensorInfo) = 0;
        virtual int onSensorChanged(SensorInfo& sensorInfo) = 0;
        virtual int onSensorRemoved(const string& sensorInfo) = 0;

        virtual void notifyEvent(const SensorStatus& status, const string& url) {}
        virtual void refreshSensorList() {}
};

class ISensorDiscoveryInterface
{	
public:
    ISensorDiscoveryInterface() {}
    virtual ~ISensorDiscoveryInterface() {}

    virtual void start() = 0;
    virtual void stop()  = 0;
    virtual int searchSensor(SensorInfo& sensor) { return -1; }

    void registerSensorDiscoveryListener(ISensorDiscoveryEvent* listner)
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        if (std::find(m_listners.begin(), m_listners.end(), listner) == m_listners.end())
        {
            m_listners.push_back(listner);
        }
    }

    void deregisterSensorDiscoveryListener(ISensorDiscoveryEvent* listner)
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        m_listners.erase(std::remove(m_listners.begin(), m_listners.end(), listner), m_listners.end());
    }

    int publishOnSensorFound(SensorInfo& sensor)
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        int ret = 0;
        for (ISensorDiscoveryEvent* listner : m_listners)
        {
            ret |= listner->onSensorFound(sensor);
        }
        return ret;
    }

    int publishOnSensorChanged(SensorInfo& sensor)
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        int ret = 0;
        for (ISensorDiscoveryEvent* listner : m_listners)
        {
            ret |= listner->onSensorChanged(sensor);
        }
        return ret;
    }

    int publishOnSensorRemoved(const string& sensor_id)
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        int ret = 0;
        for (ISensorDiscoveryEvent* listner : m_listners)
        {
            ret |= listner->onSensorRemoved(sensor_id);
        }
        return ret;
    }

    void refreshCacheSensorList()
    {
        std::lock_guard<std::mutex> lock(m_sensorDiscoveryLock);
        for (ISensorDiscoveryEvent* listner : m_listners)
        {
            listner->refreshSensorList();
        }
    }

    void setCacheSensorList(std::vector<shared_ptr<SensorInfo>> list)
    {
        std::lock_guard<std::mutex> lock(m_cacheSensorLock);
        m_cacheSensorList = list;
    }
    std::vector<shared_ptr<SensorInfo>> getCacheSensorList()
    {
        std::lock_guard<std::mutex> lock(m_cacheSensorLock);
        return m_cacheSensorList;
    }

private:
    std::vector<ISensorDiscoveryEvent*> m_listners;
    std::mutex m_sensorDiscoveryLock;
    std::mutex m_cacheSensorLock;
    std::vector<shared_ptr<SensorInfo>> m_cacheSensorList;
};

ISensorDiscoveryInterface* createDiscoveryObject();
void destroyDiscoveryObject(ISensorDiscoveryInterface* object);

typedef ISensorDiscoveryInterface* (*createDiscoveryObject_t) (void);
typedef void (*destroyDiscoveryObject_t) (ISensorDiscoveryInterface*);

} //nv_vms