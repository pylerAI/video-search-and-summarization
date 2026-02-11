/*
 * SPDX-FileCopyrightText: Copyright (c) 2024-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
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

#include "error_code.h"
#include "sensor_info.h"
#include "vms_media_interface.h"

using namespace std;

#define DEFAULT_RX_SOCKET_BUFFER_SIZE 1 * 1024 * 1024
#define DEFAULT_TX_SOCKET_BUFFER_SIZE 1 * 1024 * 1024
#define DEFAULT_TX_RTP_PACKET_SIZE 1300
#define DEFAULT_PROXYCLIENT_JITTER_BUFFER_SIZE_MS 200
#define DEFAULT_PROMETHEUS_PORT "8080"
#define DEFAULT_FRAMERATE 30
#define DEFAULT_ENCODING "H264"
#define DEFAULT_BITRATE_KBPS 8000
#define DEFAULT_RESOLUTION "1920x1080"
#define DEFAULT_MAX_GOVLENGTH 60
#define DEFAULT_QUALITY 3
#define DEFAULT_ENCODING_INTERVAL 1
#define DEFAULT_PROFILE "Main"
#define DEFAULT_WEBRTC_SENDER_QUALITY "pass_through"
#define DEFAULT_CUOSD_FONT_TYPE "DejaVuSansMono.ttf"
#define WEBRTC_OUT_FALLBACK_SOFTWARE "software"
#define WEBRTC_OUT_FALLBACK_PASS_THROUGH "pass_through"
#define DEFAULT_IPC_SOCKET_PATH "/tmp/"

#define MAX_TOLERANCE_SECS 2
#define RETRIES_FOR_DEVICE_ID 2
#define DEFAULT_FILE_EXPIRY_MINUTES 10080
#define DEFAULT_INGRESS_ENDPOINT "30888/vst"

static const string TYPE_VST  = "vst";
static const string TYPE_MMS  = "mms";
static const string TYPE_EVENT  = "event";
static const string TYPE_STREAMER  = "streamer";
static const string TYPE_UNKNOWN  = "unknown";

static const string VST_REMOTE  = "remote";
static const string VST_RTSP  = "vst_rtsp";

namespace nv_vms {

class ISensorControlInterface;
class ISensorDiscoveryInterface;
class SensorControl;

typedef void (*cb_ptr_t)(const string, shared_ptr<struct SensorInfo>, bool);

enum ModuleId
{
    ModuleInvalid = -1,
    ModuleAll = 0,
    ModuleRtspServer,
    ModuleSensorManagement,
    ModuleStorageManagement,
    ModuleStreamRecorder,
    ModuleLiveStream,
    ModuleReplayStream,
    ModuleStreamBridge
};

typedef struct
{
    int64_t frameId = -1;
    int64_t timestamp = 0;
} FrameInfoSeiPayload;

struct DeviceConfig
{
    string recorded_video_root;
    std::vector<string> stunurl_list;
    std::vector<string> static_turnurl_list;
    std::vector<string> ntpServers;
    string http_port;
    std::vector<string> sensor_discovery_interfaces;
    string vst_data_path;
    string message_broker_topic;
    string message_broker_payload_key;
    string message_broker_metadata_topic;
    string redis_cfg;
    string redis_server_env_var;
    string kafka_server_address;
    string mqtt_broker_address;
    bool enable_notification;
    string use_message_broker;
    bool enable_notification_consumer;
    string use_message_broker_consumer;
    string message_broker_topic_consumer;
    string video_metadata_server;
    bool enable_gem_drawing;
    string analytic_server_address;
    string calibration_file_path;
    string calibration_mode;
    bool use_camera_groups;
    bool enable_recentering;
    string floor_map_file_path;
    string overlay_3d_sensor_name;
    string overlay_text_font_type;
    int bbox_tolerance_ms;
    bool enable_overlay_skip_frame;
    std::map<std::string, std::vector<int>> color_map;
    Json::Value overlay_class_labels;
    Json::Value overlay_color_code;
    Json::Value overlay_proximity_labels;
    int sensor_discovery_timeout;
    int sensor_discovery_freq_secs;
    int onvif_request_timeout_secs;
    int onvif_sensor_time_sync_interval_secs;
    int onvif_sensor_time_sync_compensation_ms;
    bool enable_perf_logging;
    int max_webrtc_out_connections;
    int max_webrtc_in_connections;
    string storage_config_file;
    size_t total_video_storage_size_MB;
    double storage_threshold_percentage;
    double storage_monitoring_frequency_secs;
    bool enable_aging_policy;
    size_t max_video_download_size_MB;
    bool always_recording;
    bool event_recording;
    int event_record_length_secs;
    int record_buffer_length_secs;
    bool use_software_path;
    bool use_software_encoder;
    string use_webrtc_inbuilt_encoder;
    string webrtc_in_fixed_resolution;
    int webrtc_in_max_framerate;
    int webrtc_in_video_bitrate_thresold_percentage;
    bool webrtc_in_passthrough;
    string webrtc_sender_quality;
    bool enable_rtsp_server_sei_metadata;
    bool enable_proxy_server_sei_metadata;
    bool enable_camera_auto_discovery;
    string webservice_access_control_list;
    string rtsp_preferred_network_iface;
    int rtsp_server_port;
    int rtsp_server_instances_count;
    bool rtsp_server_use_socket_poll;
    bool rtcp_rtp_port_multiplex;
    int rtsp_in_base_udp_port_num;
    int rtsp_out_base_udp_port_num;
    bool rtsp_streaming_over_tcp;
    int rtsp_server_reclamation_client_timeout_sec;
    string server_domain_name;
    bool use_coturn_auth_secret;
    vector<string> coturn_turnurl_list_with_secret;
    bool use_twilio_stun_turn;
    string twilio_account_sid;
    string twilio_auth_token;
    bool use_reverse_proxy;
    string reverse_proxy_server_address;
    bool use_sensor_ntp_time;
    int max_sensors_supported;
    int stream_monitor_interval_secs;
    int udp_latency_ms;
    bool udp_drop_on_latency;
    uint64_t webrtc_latency_ms;
    bool enable_frame_drop;
    int video_metadata_query_batch_size_num_frames;
    bool enable_qos_monitoring;
    string qos_logfile_path;
    int qos_data_capture_interval_sec;
    int qos_data_publish_interval_sec;
    bool enable_gst_debug_probes;
    uint32_t rx_socket_buffer_size;
    uint32_t tx_socket_buffer_size;
    uint32_t tx_rtp_packet_size;
    bool enable_packet_pacing;
    uint32_t rtp_packet_pace_time_us;
    uint32_t rtp_packet_batch_size;
    uint32_t proxyclient_jitter_buffer_size_ms;
    bool enable_prometheus;
    string prometheus_port;
    bool enable_system_metric;
    int system_metric_interval_sec;
    string nv_streamer_directory_path;
    bool nv_streamer_loop_playback;
    bool nv_streamer_seekable;
    bool nv_streamer_sync_playback;
    int nv_streamer_sync_file_count;
    size_t nv_streamer_max_upload_file_size_MB;
    std::vector<string> media_containers;
    std::vector<string> metadata_containers;
    int nv_streamer_rtsp_server_output_buffer_size_kb;
    std::vector<string> video_codecs;
    std::vector<string> audio_codecs;
    int default_bitrate;
    double default_framerate;
    string default_resolution;
    int default_gov_length;
    string default_profile;
    double default_quality;
    int default_encoding_interval;
    bool enable_highlighting_logs;
    bool enable_debug_apis;
    bool dump_webrtc_input_stats;
    bool enable_network_bandwidth_notification;
    bool enable_frameid_in_webrtc_stream;
    bool use_http_digest_authentication;
    bool use_multi_user;
    bool enable_user_cleanup;
    int session_max_age_sec;
    std::vector<string> multi_user_extra_options;
    string nv_org_id;
    string nv_ngc_key;
    string nv_org_id_key;
    bool use_https;
    bool use_rtsp_authentication;
    string password_file_path;
    int webrtc_peer_conn_timeout_sec;
    bool use_video_metadata_protobuf;
    bool enable_grpc;
    string grpc_server_port;
    string ai_bridge_endpoint;
    int webrtc_in_audio_sender_max_bitrate;
    string webrtc_in_video_degradation_preference;
    bool enable_websocket_pingpong;
    int websocket_keep_alive_ms;
    int	webrtc_in_video_sender_max_framerate;
    vector<int> gpu_indices;
    string rtp_udp_port_range;
    bool webrtc_out_enable_insert_sps_pps;
    int webrtc_out_set_iframe_interval;
    int webrtc_out_set_idr_interval;
    int webrtc_out_min_drc_interval;
    string webrtc_out_encode_fallback_option;
    string remote_vst_address;
    Json::Value webrtc_port_range;
    Json::Value webrtc_video_quality_tunning;
    string device_name;
    string device_location;
    bool enable_dec_low_latency_mode;
    bool enable_avsync_udp_input;
    bool use_standalone_udp_input;
    bool enable_silent_audio_in_udp_input;
    bool enable_udp_input_dump;
    bool enable_latency_logging;
    string centralize_db_name;
    string centralize_db_username;
    string centralize_remote_db_password;
    string centralize_remote_db_hostaddr;
    string centralize_remote_db_port;
    bool use_centralize_local_db;
    bool use_centralize_db;
    int max_centralize_db_conn;
    string webrtc_out_default_resolution;
    bool enable_ipc_path;
    string ipc_socket_path;
    bool ipc_src_buffer_timestamp_copy;
    int  ipc_src_connection_attempts;
    int  ipc_src_connection_interval_us;
    bool ipc_sink_buffer_timestamp_copy;
    bool ipc_sink_buffer_copy;
    bool use_external_peerconnection;
    bool use_stream_sdk;
    bool enable_mega_simulation;
    int mega_simulation_delay_min_ms;
    int mega_simulation_delay_max_ms;
    string mega_simulation_base_time;
    int default_file_expiry_minutes;
    string ingress_endpoint;
    bool use_webrtc_hw_dec;
    bool recorder_enable_frame_drop;
    int recorder_max_frame_queue_size_bytes;
    string webrtc_out_enc_quality_tuning;
    string webrtc_out_enc_preset;
    bool enable_drc;
    bool enable_loopback_multicast;
    std::map<ModuleId, string> module_endpoints;
    string tokkio_plugin_server_url;
    int update_record_details_in_sec; // 5 to 60
    bool enable_cloud_storage;
    string cloud_storage_type;
    string cloud_storage_endpoint;
    string cloud_storage_access_key;
    string cloud_storage_secret_key;
    string cloud_storage_bucket;
    string cloud_storage_region;
    bool cloud_storage_use_ssl;
    int download_files_timeout_secs;
    int halo_safety_udp_port;
    string halo_safety_proximity_class;
    int halo_safety_text_size;
    string halo_safety_active_text;
    string halo_safety_active_text_color;
    string halo_safety_active_text_bg_color;
    string halo_safety_inactive_text;
    string halo_safety_inactive_text_color;
    string halo_safety_inactive_text_bg_color;
    bool enable_telemetry;
    string otlp_endpoint;

    DeviceConfig();

    void printInfo();
};

struct DeviceManager
{
    string name;
    string id;
    string location;
    string ip;
    string user;
    string password;
    string port;
    string url;
    string type;
    string errorString;
    bool isOnline;
    bool isRemoteDevice;
    bool isRtspAdaptor;
    bool isError;
    std::mutex m_sensorsMutex;
    bool enabled;
    bool needRtspServer;
    std::atomic<bool> m_isRtspServerReady {false};
    bool needStreamMonitoring;
    bool needRecording;
    bool needStorageMngt;
    std::pair<ISensorControlInterface*, void*> m_sensorControlobjectPair;
    std::vector<std::pair<ISensorDiscoveryInterface*, void*>> m_sensorDiscoveryObjectPairList;
    int httpStatusCode;
    cb_ptr_t m_callback;
    private:
        map<string, shared_ptr<SensorInfo>> sensors;
        std::time_t m_lastAccessTime;

private:
    Json::Value getSensorDetails(Json::Value& array, const string& in_id);
public:
    DeviceManager();
    ~DeviceManager();
    void registerCallback(cb_ptr_t cb);
    map<string, shared_ptr<SensorInfo>> getSensors();
    shared_ptr<SensorInfo> findSensor(const string& sensor_id);
    int getSensorsSize();
    bool isSpaceForNewSensor();
    void clearSensorList();
    string createUniqueName(string name);
    void addSensorList(vector<shared_ptr<SensorInfo>> list);
    string addSensor(shared_ptr<SensorInfo>& sensor);
    bool sensorExists(const string& id);
    bool sensorExists(const shared_ptr<SensorInfo>& sensor);
    bool isNameExists(const string& name);
    int updateSensorInfo(const SensorInfo& sensor);
    void setPTZInfoIntoSensorInfo(string id, map<PTZAction, ptzRange> ptz);
    vector<shared_ptr<SensorInfo>> getSensorList(bool fetchFromDB = false);
    vector<shared_ptr<StreamInfo>> getStreamList(bool fetchFromDB = false);
    shared_ptr<SensorInfo> getSensor(const string id);
    shared_ptr<StreamInfo> getStream(const string sensor_id, const string stream_id);
    void deleteSensor(const string id);
    void removeStream(const string& url);
    void removeStream(const string& stream_id, const string& sensor_id);
    void removeStreamOrSensor(const string& stream_id);
    map<PTZAction, ptzRange> getSensorPTZInfo(const string id);
    void updateSensorListFromDB();
    void replaceSensor(const string& old_id, const string& new_id);
    void updateDeviceId();
    void updateDeviceName();
    void updateDeviceLocation();
    void updateDeviceDetails();
    void printInfo();
    void deviceManagerInit(ModuleId module_id);
    string getDeviceId();
    string getDeviceName();
    string getDeviceLocation();
    string getDeviceType();
    bool isDeviceRemote();
    bool getSensorIdFromStreamId(const string& streamId, string &sensorId);
    string getDeviceURL();
    shared_ptr<SensorInfo> getSensorInfo(const string& sensor_id, bool fetchFromDB = false);
    shared_ptr<SensorInfo> searchSensor(const string& id);
    void removeStreamsFromSensor(const string &sensor_id);
    void updateSensorStatus(const SensorStatus& status);
    std::shared_ptr<SensorInfo> addOrUpdateSensor(const SensorInfo& in_sensor);
    bool requiredRtspServer();
    bool requiredRecording();
    bool requiredStorageMngt();
};
} //nv_vms