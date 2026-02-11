/*
 * SPDX-FileCopyrightText: Copyright (c) 2019-2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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
#include <vector>
#include <array>
#include <memory>
#include <map>
#include <mutex>
#include <utility>
#include <condition_variable>
#include <atomic>
#include <set>
#include <jsoncpp/json/json.h>
#include <curl/curl.h>
#include "error_code.h"

using namespace std;

#define SENSOR_TYPE_ONVIF "sensor_onvif"
#define SENSOR_TYPE_MMS_ONVIF "sensor_mms_onvif"
#define SENSOR_TYPE_RTSP "sensor_rtsp"
#define SENSOR_TYPE_NVSTREAM "sensor_nvstream"
#define SENSOR_TYPE_UDP "sensor_udp"
#define SENSOR_TYPE_WEBRTC "sensor_webrtc"
#define SENSOR_TYPE_GENERIC "sensor_generic"
#define SENSOR_TYPE_REMOTE "sensor_edge"
#define SENSOR_TYPE_CSI "sensor_csi"
#define SENSOR_TYPE_FILE "sensor_file"

// Record config values
#define RECORD_CONFIG_CLOUD_SCANNED "Cloud"  // For cloud-scanned/imported files

#define MAX_SENSOR_NAME_LENGTH 175
#define MAX_FILE_NAME_LENGTH 140
namespace nv_vms {

class SensorControl;
class NvSoap;

struct Range
{
    string min;
    string max;
};

struct Rect
{
    string bottom;
    string top;
    string right;
    string left;
};

struct MultiCast
{
    string AddressType;
    string IPAddress;
    string Port;
    string TTL;
    string AutoStart;
};

struct Token
{
    string profileName;
    string encoderToken;
    string sourceToken;
    string profileToken;
    string ptzToken;
    string ptzNodeToken;
};

struct Resolution
{
    string width;
    string height;

    void operator=(const string& value);
    bool operator==(const Resolution& res);
    bool empty() const;
    string getString() const;
    int getPixels() const;

};

struct VideoEncoderConfigurationsOptions
{
    Range EncodingIntervalRange;
    Range BitrateRange;
    Range GovLengthRange;
    std::string FrameRateSupported;
    vector <Resolution> ResolutionsAvailable;
    std::string encoding;
    Range qualityRange;
    vector <string> profilesSupported;
};

struct SensorEncoderSettingsOptions
{
    vector <VideoEncoderConfigurationsOptions> encoderSettingsOptions;
    vector <string> videoEncodingSupported;
};

enum AuthenticationMethods
{
    AUTH_METHOD_NONE            = 0,        // No flags set
    AUTH_METHOD_USERNAME_TOKEN  = 1 << 0,   // Bit 0
    AUTH_METHOD_DIGEST          = 1 << 1    // Bit 1
};

struct ServiceCapabilities
{
    AuthenticationMethods supportedAuthMethods = AUTH_METHOD_NONE;
    AuthenticationMethods securedAuthMethod = AUTH_METHOD_NONE;
    string supportedHashingAlgorithms;
};

struct HashingAlgorithmInfo
{
    std::string algorithm;  // e.g., "SHA-256"/"MD5,SHA-256"/"MD5"
};

class ClientSession
{
    public:
        virtual ~ClientSession();
        ClientSession();

        CURL* getCurlClient();
        std::shared_ptr<NvSoap> getNvSoap();
    protected:
        CURL* m_curl;
        std::shared_ptr<NvSoap> m_nvsoap;
};

struct SensorVideoEncoderSettingsValues
{
    string container;
    string encoding;
    Resolution resolution;
    string frameRate;
    string bitrate;
    string encodingInterval;
    string encodingProfile;
    string quality;
    string govLength;
    string numFrames;
};

struct SensorAudioEncoderSettingsValues
{
    bool   enable;
    string container;
    string encoding;
    string sample_rate;
    string bits_per_sample;
    string channels;
};

struct SensorNetworkInfo
{
    std::pair<string, bool> token;
    string interfaceName;

    bool enableIpv4 = false;
    string enableDhcp4;
    string IPAddr4;
    string prefixLen4;

    bool enableIpv6 = false;
    string enableDhcp6;
    string IPAddr6;
    string prefixLen6;
};

enum CamTNRMode
{
    GST_NVCAM_NR_OFF = 0, // NoiseReduction_Off
    GST_NVCAM_NR_FAST, // NoiseReduction_Fast (Default)
    GST_NVCAM_NR_HIGHQUALITY, // NoiseReduction_HighQuality
    GST_NVCAM_NR_MAX
};

enum CamwbMode
{
    GST_NVCAM_WB_MODE_OFF = 0, // off
    GST_NVCAM_WB_MODE_AUTO, // auto
    GST_NVCAM_WB_MODE_INCANDESCENT, // incandescent
    GST_NVCAM_WB_MODE_FLUORESCENT, // fluorescent
    GST_NVCAM_WB_MODE_WARM_FLUORESCENT, // warm-fluorescent
    GST_NVCAM_WB_MODE_DAYLIGHT, // daylight
    GST_NVCAM_WB_MODE_CLOUDY_DAYLIGHT, // cloudy-daylight
    GST_NVCAM_WB_MODE_TWILIGHT, // twilight
    GST_NVCAM_WB_MODE_SHADE, // shade
    GST_NVCAM_WB_MODE_MANUAL, // manual
    GST_NVCAM_WB_MODE_MAX
};

enum AeAntibandingMode
{
    GST_NVCAM_AEANTIBANDING_OFF = 0, // AeAntibandingMode_Off
    GST_NVCAM_AEANTIBANDING_AUTO, // AeAntibandingMode_Auto
    GST_NVCAM_AEANTIBANDING_50HZ, // AeAntibandingMode_50HZ
    GST_NVCAM_AEANTIBANDING_60HZ, // AeAntibandingMode_60HZ
    GST_NVCAM_AEANTIBANDING_MAX
};

enum EdgeEnhancementMode
{
    GST_NVCAM_EE_OFF = 0, // EdgeEnhancement_Off
    GST_NVCAM_EE_FAST, // EdgeEnhancement_Fast
    GST_NVCAM_EE_HIGHQUALITY, // EdgeEnhancement_HighQuality
    GST_NVCAM_EE_MAX
};

struct SensorImageSettingsOptions
{
    Range Brightness;
    Range ColorSaturation;
    Range Contrast;
    Range Sharpness;
    vector<string> BacklightCompensationModes; // ON/OFF
    Range BacklightCompensationLevel;
    vector<string> ExposureModes; // AUTO/MANUAL
    vector<string> ExposurePriorities; // LowNoise/FrameRate
    Range MinExposureTime;
    Range MaxExposureTime;
    Range ExposureMaxGain;
    Range ExposureTime;
    Range ExposureGain;
    vector<string> IrCutFilterModes; // OFF/ON/AUTO
    vector<string> WideDynamicRangeModes; // OFF/ON
    Range WideDynamicRangeLevel;
    vector<string> WhiteBalanceModes; // AUTO/MANUAL
    Range WhiteBalanceYrGain;
    Range WhiteBalanceYbGain;

    /* Native sensor settings */
    vector<string> TemporalNoiseReductionModes;
    vector<string> AeAntibandingModes;
    vector<string> EdgeEnhancementModes;
    Range EdgeEnhancementStrength;
    Range ExposureCompensation;
};

struct SensorImageSettingsValues
{
    string Brightness;
    string ColorSaturation;
    string Contrast;
    string Sharpness;
    string BacklightCompensationMode; // ON/OFF
    string BacklightCompensationLevel;
    string ExposureMode; // AUTO/MANUAL
    string ExposurePriority; // LowNoise/FrameRate
    Rect ExposureWindow;
    string MinExposureTime;
    string MaxExposureTime;
    string ExposureMaxGain;
    string ExposureTime;
    string ExposureGain;
    string IrCutFilterMode; // OFF/ON/AUTO
    string WideDynamicRangeMode; // OFF/ON
    string WideDynamicRangeLevel;
    string WhiteBalanceMode; // AUTO/MANUAL
    string WhiteBalanceYrGain;
    string WhiteBalanceYbGain;

    /* Native sensor Settings */
    string TemporalNoiseReductionMode;
    string AeAntibandingMode;
    string EdgeEnhancementMode;
    string EdgeEnhancementStrength;
    string ExposureCompensation;
};

struct SensorSettings
{
    SensorImageSettingsValues imageValues;
    SensorImageSettingsOptions imageOptions;
    SensorEncoderSettingsOptions encoderOptions;
    SensorVideoEncoderSettingsValues encoderValues;
    SensorAudioEncoderSettingsValues audioEncoderValues;
    MultiCast multiCast;
    Token token;
};

struct SensorStatus
{
    SensorStatusEvent event;
    string sensorId;
    string serverId;
    string timeStamp;
    string type;
    string sensorName;
    string tags;

    SensorStatus();
    static string getEventString(const SensorStatusEvent event);
};

struct SensorPosition
{
    pair<string, string> origin;
    pair<string, string> geoLocation;
    pair<string, string> coordinates;
    string direction;
    string fieldOfView;
    string depth;
    SensorPosition();
    void operator=(const SensorPosition& pos);
    void printInfo();
};

struct SensorMetadata
{
    map<string, string> data;
    public:
        void printInfo();
};

struct UserInfo
{
    string username;
    UserInfo();
};

enum StreamType
{
    Http,
    Hls,
    Rtsp,
    FileDownload,
    Udp,
    Webrtc,
    Native,
    NotSupported
};

enum StreamDirection
{
    StreamDirectionInvalid = -1,
    StreamDirectionIn,
    StreamDirectionOut,
    StreamDirectionBidirectional
};

struct ptzRange
{
    string x_min;
    string x_max;
    string y_min;
    string y_max;
};

enum PTZAction
{
    PanTilt = 0,
    Zoom,
    Unknown = 0xFFFF
};

enum StreamStorageType
{
    StreamStorageTypeLocal = 0,
    StreamStorageTypeCloud,
    StreamStorageTypeUnknown
};

inline string StreamStorageTypeToString(StreamStorageType storageType)
{
    switch (storageType)
    {
        case StreamStorageTypeLocal:   return "Local";
        case StreamStorageTypeCloud:   return "Cloud";
        case StreamStorageTypeUnknown: return "Unknown";
        default:                       return "Unknown";
    }
}

inline string PTZActionToString(PTZAction ptz)
{
    switch ((int)ptz)
    {
        case PTZAction::PanTilt :   return "PanTilt";
        case PTZAction::Zoom :   return "Zoom";
        default:      return "Unknown";
    }
}

inline PTZAction PTZStringtoOperation(string op)
{
    if (op == "PanTilt")
    {
        return PTZAction::PanTilt;
    }
    else if ( op == "Zoom")
    {
        return  PTZAction::Zoom;
    }
    else
    {
        return PTZAction::Unknown;
    }
}

struct StreamInfo
{
    string live_url;
    string replay_url;
    string live_proxy_url;
    string name;
    string socket_name;
    string id;
    string sensorId;
    bool isMainStream;
    StreamStorageType storageLocation;  // Storage location: Local, Cloud, or Unknown
    StreamType stream_type;
    StreamDirection direction;
    SensorSettings settings;
    std::mutex m_streamLock;
    int duration;
private:
    std::pair<StreamStatus, string> eStatusCode;
public:
    StreamInfo ();
    void printInfo();
    void updateErrorStatus(const std::pair<StreamStatus, string> error, bool updateDB = true);
    void updateVideoEncoderValues(const SensorVideoEncoderSettingsValues&, bool updateDB = true);
    SensorVideoEncoderSettingsValues& getvideoEncoderValues();
    void updateVideoEncoderOptions(const SensorEncoderSettingsOptions&);
    SensorEncoderSettingsOptions& getvideoEncoderOptions();
    void updateAudioEncoderValues(const SensorAudioEncoderSettingsValues&, bool updateDB = true);
    SensorAudioEncoderSettingsValues& getAudioEncoderValues();
    void updateImageValues(const SensorImageSettingsValues&);
    std::pair<StreamStatus, string> getErrorStatus();
    void updateStreamtype(const StreamType type);
    Json::Value toJson(bool isStreamerDevice = false);
};

struct OnvifServiceInfo
{
    std::string name_space;
    std::string url;
};

struct SensorInfo
{
    string id;
    string sensorId;
    string ip;
    string name;
    string url;
    map<string, OnvifServiceInfo> serviceUrls;
    string model;
    string hardware;
    string manufacturer;
    string firmware_version;
    string serial_number;
    string hardware_id;
    string location;
    string tags;
    string user;
    string password;
    vector<shared_ptr<StreamInfo>> streams;
    vector<shared_ptr<SensorMetadata>> metadata;
    map<PTZAction, ptzRange> ptzInfo;
    set<shared_ptr<UserInfo>> users;
    bool isAutoDiscovered;
    string type;
    SensorPosition position;
    std::mutex m_sensorLock;
    std::mutex m_streamLock;
    std::mutex m_userLock;
    bool m_notify;
    bool isRemoteSensor;
    string remoteDeviceId;
    string remoteDeviceName;
    string remoteDeviceLocation;
    ServiceCapabilities serviceCapabilities;
    std::shared_ptr<ClientSession> clientSession;
    SensorStatusEvent sensorStatus;
private:
    std::mutex sessionMutex;
public:
    std::pair<int, string> httpStatusCode;

    SensorInfo();
    SensorInfo (const SensorInfo& sensorInfo);
    ~SensorInfo();
    void operator=(const SensorInfo& sensorInfo);
    bool operator==(const string& id);
    bool operator==(const SensorInfo& sensorInfo);
    void updateStreams(vector<shared_ptr<StreamInfo>>& InStreams);
    bool addStreams(shared_ptr<StreamInfo>& in_stream);
    void clearStreams();
    vector<shared_ptr<StreamInfo>>& getStreams();
    vector<shared_ptr<SensorMetadata>> getMetadata();
    shared_ptr<StreamInfo> getStream(const string& id);
    void clearServiceUrls();
    void updateSensorStatus(const SensorStatusEvent status);
    SensorStatusEvent getSensorStatus();
    void updateHttpErrorStatus(const std::pair<int, string> http_error);
    std::pair<int, string> getHttpErrorStatus();
    void updateCredentials(const string& in_username, const string& in_password);
    std::pair<string, string> getCredentials();
    void printInfo();
    bool isPTZSuported();
    void addUser(shared_ptr<UserInfo> user);
    void removeUser(string username);
    bool checkUser(string username);
    string getUsersString();
    void addUsersFromString(string users);
    std::shared_ptr<ClientSession>& getClientSession();
    Json::Value getStreamsJson(bool isStreamerDevice = false);
};

}