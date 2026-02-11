const chai = require("chai");
const expect = chai.expect;
const chaiHttp = require("chai-http");
var ip = require("ip");
const axios = require('axios').default;
let iceServers = [];
let earlyCandidates = [];
const PEER_CONNECTION_OPTIONS = { optional: [{ DtlsSrtpKeyAgreement: true }] };
const OFFER_OPTIONS = { offerToReceiveAudio: true, offerToReceiveVideo: true };
chai.should();
chai.use(chaiHttp);
const args = require('minimist')(process.argv.slice(2));
const ipFromTerminal = args['ip'];
const iterations = args['iteration']

//get network IP
//const networkIp = getNetworkIp();
let vmsUrl = "http://" + "vms-vms-svc" + ":30000";
if(ipFromTerminal != null) {
  vmsUrl = "http://" + "vms-vms-svc" + ":30000";
}
console.log("VMS URL: ", vmsUrl);

//define global variables
let start_time = '';
let end_time = '';
let camera = {};
let cameraId = {};
let addCameraUsingIp = {};
let addCameraUsingRtsp = {};
let deleteCamera = {};
let failures = [];
let successes = [];

//central location for most api keys
class ApiKeys {
  constructor(path) {
    this.path = path;
  }
  getApiKeys() {
    if(this.path === "get api/device/list" || this.path === "get api/device/info") {
      return ([
        'firmware_version',
        'hardware',
        'hardware_id',
        'id',
        'ip',
        'location',
        'manufacturer',
        'name',
        'position',
        'serial_number'
      ])
    }
    if(this.path === "get api/device/{deviceId}/settings") {
      return ([
        'Encode',
        'Image'
      ])
    }
    if(this.path === "get api/device/{deviceId}/settings/Encode") {
      return ([
        'Encode'
      ])
    }
    if(this.path === "get api/device/{deviceId}/settings/Image") {
      return ([
        'Image'
      ])
    }
    if(this.path === "get api/device/{deviceId}/status" || this.path === "get api/device/status") {
      return ([
        'error_code',
        'error_message',
        'name',
        'state'
      ])
    }
    if(this.path === "get api/device/{deviceId}/record/files") {
      return ([
        'file_duration',
        'file_path',
        'start_time'
      ])
    }
    if(this.path === "get api/vms/settings") {
      return ([
        "device_discovery_interfaces",
        "device_discovery_timeout_secs",
        "enable_aging_policy",
        "enable_gst_debug_probes",
        "enable_perf_logging",
        "enable_prometheus",
        "enable_qos_monitoring",
        "enable_stream_monitoring",
        "http_port",
        "max_devices_supported",
        "max_webrtc_connections",
        "onvif_request_timeout_secs",
        "prometheus_port",
        "qos_data_capture_interval_sec",
        "qos_data_publish_interval_sec",
        "qos_logfile_path",
        "recorded_video_dir_root",
        "recorded_video_total_size_MB",
        "redis_server_env_var",
        "rtsp_in_base_udp_port_num",
        "rtsp_preferred_network_iface",
        "rtsp_server_port",
        "server_domain_name",
        "storage_monitoring_frequency_secs",
        "storage_threshold_percentage",
        "stream_monitor_interval_secs",
        "stunurl",
        "supported_audio_codecs",
        "supported_video_codecs",
        "total_video_storage_size_MB",
        "turnurl",
        "use_http_digest_authentication",
        "use_https",
        "use_rtsp_authentication",
        "video_metadata_query_batch_size_num_frames",
        "video_metadata_server",
        "vst_data_path",
        "vst_ip",
        "webservice_access_control_list"
      ])
    }
    if(this.path === "get /api/getLiveStreamUriList") {
      return ([
        'id',
        'live_url',
        'name'
      ])
    }
    if(this.path === "get /api/getReplayStreamUriList") {
      return ([
        'id',
        'replay_url',
        'name'
      ])
    }
  }
}

//show hide video on index.html
function toggleVideoDisplay() {
  var doc = document.getElementById("videoDiv");
  if (doc.style.display === "none") {
    doc.style.display = "block";
  } else {
    doc.style.display = "none";
  }
}

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

//get IP address automatically
function getNetworkIp() {
  let networkIp = ip.address();
  //window will be undefined if running in browser
  if(typeof window !== 'undefined') {
    networkIp = window.location.hostname;
  }
  return networkIp;
}

function generateRandomText() {
  return Math.random().toString(36).substring(7);
}

function vmsTest(currentIteration) {
  //decsribe is the first block of code that runs
  describe("API test", function () {
    this.slow(1000);
    beforeEach(function (done) {
      setupData = require("./cameraDetails.json");
      axios.get(`${vmsUrl}/api/version`)
      .then((value) => {
        adaptorType = value.data.type;
      })
      if(Object.keys(camera).length === 0 && setupData.camera != null && typeof window === 'undefined') {
        camera = setupData.camera;
        axios.get(`${vmsUrl}/api/device/list`)
          .then((value) => {
            let cameraList = value.data;
            for(let i=0; i< cameraList.length; i++) {
              if(cameraList[i].name === camera.name) {
                camera.id = cameraList[i].id;
                cameraNameForReplace = cameraList[i].name;
                break;
              }
            }
            if(camera.id == null) {
              return done(new Error("Camera id is null"));
            }
          })
      }
      if(Object.keys(cameraId).length === 0 && setupData.camera != null && setupData.camera.id != null && typeof window === 'undefined') {
        cameraId = setupData.camera.id;
      }
      if(Object.keys(addCameraUsingIp).length === 0 && setupData.add_camera_using_ip != null && typeof window === 'undefined') {
        addCameraUsingIp = setupData.add_camera_using_ip;
      }
      if(Object.keys(addCameraUsingRtsp).length === 0 && setupData.add_camera_using_rtsp != null && typeof window === 'undefined') {
        addCameraUsingRtsp = setupData.add_camera_using_rtsp;
      }
      if(Object.keys(deleteCamera).length === 0 && setupData.delete_camera != null && typeof window === 'undefined') {
        deleteCamera = setupData.delete_camera;
      } 
      done();
    });
    before(function () {
      if(iterations != null) {
        console.info("\x1b[35m", "iteration: ", currentIteration);
      }
      if(typeof window !== 'undefined') {
        showToast(`Current iteration: ${currentIteration}`);
        document.getElementById("iterationNumber").innerHTML = `<b>Current iteration: </b>${currentIteration}`;
      }
    });
    beforeEach(function (done) {
      if(this.currentTest.title === "get /api/stream/status") {
        setTimeout(function(){
          done();
        }, 1000);
      }
      else {
        setTimeout(function(){
          done();
        }, 200);
      }
      if(this.currentTest.title === "Recording for 30 seconds" && typeof window !== 'undefined') {
        showToast("Recording for 30 seconds...");
      }
    });
    //afterEacch runs after every it block
    afterEach(function () {
      const title = this.currentTest.title;
      const state = this.currentTest.state;
      if (state === "passed") {
          successes.push(title)
      } else if (state === "failed") {
          failures.push(title)
      }
    });
    describe('Camera APIs ', () => {
      it('get api/device/list', async function () {
        const response = await chai.request(vmsUrl)
        .get('/api/device/list');
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          //console.log(responseText)
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('array');
          expect(responseText).to.have.lengthOf.above(0);
          let keys = new ApiKeys("get api/device/list");
          let keysArr = keys.getApiKeys();
          for(let i = 0; i < responseText.length; i++) {
            for(let j = 0; j < keysArr.length; j++) {
              expect(responseText[i]).to.haveOwnProperty(keysArr[j]);
            }
          }
      }).timeout(30000)
      it(`post api/device/{deviceId}/info`, async function () {
        let cameraName = null;
        const responseGetCameraName = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/info`)
          responseGetCameraName.should.have.status(200);
          responseGetCameraNameText = JSON.parse(responseGetCameraName.text);
          expect(responseGetCameraNameText).to.not.be.null;
          expect(responseGetCameraNameText).to.not.be.undefined;
          responseGetCameraNameText.should.be.a('object');
          let keysCameraName = new ApiKeys("get api/device/info");
          let keysCameraNameArr = keysCameraName.getApiKeys();
          for(let i = 0; i < responseGetCameraNameText.length; i++) {
            for(let j = 0; j < keysCameraNameArr.length; j++) {
              expect(responseGetCameraNameText[i]).to.haveOwnProperty(keysCameraNameArr[j]);
            }
          }
          cameraName = responseGetCameraNameText.name;
        let randomText = generateRandomText();
        const response = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/info`)
        .set('content-type', 'application/json')
        .send({
          "firmware_version": randomText,
          "hardware": randomText,
          "hardware_id": randomText,
          "location": randomText,
          "manufacturer": randomText,
          "name": randomText,
          "serial_number": randomText
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
        await wait(1000);
        const responseGet = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/info`)
          responseGet.should.have.status(200);
          responseGetText = JSON.parse(responseGet.text);
          expect(responseGetText).to.not.be.null;
          expect(responseGetText).to.not.be.undefined;
          responseGetText.should.be.a('object');
          let keys = new ApiKeys("get api/device/info");
          let keysArr = keys.getApiKeys();
          for(let i = 0; i < responseGetText.length; i++) {
            for(let j = 0; j < keysArr.length; j++) {
              expect(responseGetText[i]).to.haveOwnProperty(keysArr[j]);
            }
          }
          expect(responseGetText.firmware_version).to.be.equal(randomText);
          expect(responseGetText.hardware).to.be.equal(randomText);
          expect(responseGetText.hardware_id).to.be.equal(randomText);
          expect(responseGetText.location).to.be.equal(randomText);
          expect(responseGetText.manufacturer).to.be.equal(randomText);
          expect(responseGetText.name).to.be.equal(randomText);
          expect(responseGetText.serial_number).to.be.equal(randomText);
        const responseSetName = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/info`)
        .set('content-type', 'application/json')
        .send({
          "name": cameraName
        })
          responseSetName.should.have.status(200);
          responseSetNameText = JSON.parse(responseSetName.text);
          expect(responseSetNameText).to.not.be.null;
          expect(responseSetNameText).to.not.be.undefined;
          responseSetNameText.should.be.a('boolean');
      }).timeout(30000)
      it(`get api/device/{deviceId}/info`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/info`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          let keys = new ApiKeys("get api/device/info");
          let keysArr = keys.getApiKeys();
          for(let i = 0; i < responseText.length; i++) {
            for(let j = 0; j < keysArr.length; j++) {
              expect(responseText[i]).to.haveOwnProperty(keysArr[j]);
            }
          }
      }).timeout(30000)
      it(`get api/device/{deviceId}/status`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/status`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          let keys = new ApiKeys("get api/device/{deviceId}/status");
          let keysArr = keys.getApiKeys();
          for(let j = 0; j < keysArr.length; j++) {
            expect(responseText).to.haveOwnProperty(keysArr[j]);
          }
      }).timeout(30000)
      it('get api/device/status', async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/device/status`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          let keys = new ApiKeys("get api/device/status");
          let keysArr = keys.getApiKeys();
          for (const [key, value] of Object.entries(responseText)) {
            for(let j = 0; j < keysArr.length; j++) {
              expect(responseText[key]).to.haveOwnProperty(keysArr[j]);
            }
          }
      }).timeout(30000)
      it(`post api/device/scan`, async function () {
        const response = await chai.request(vmsUrl)
        .post(`/api/device/scan`)
        .set('content-type', 'application/json')
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
      }).timeout(30000)
      it(`get api/device/{deviceId}/record`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/record`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
      }).timeout(30000)
      it(`post api/device/{deviceId}/record`, async function () {
        const response = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/record`)
        .set('content-type', 'application/json')
        .send({
          'action': 'start'
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
        await wait(1000);
        const responseGet = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/record`)
          responseGet.should.have.status(200);
          responseGetText = JSON.parse(responseGet.text);
          expect(responseGetText).to.not.be.null;
          expect(responseGetText).to.not.be.undefined;
          responseGetText.should.be.a('object');
          expect(responseGetText).to.haveOwnProperty("recording_status");
          expect(responseGetText.recording_status).to.to.equal("recording_on_user");
        const responsePost = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/record`)
        .set('content-type', 'application/json')
        .send({
          'action': 'stop'
        })
          responsePost.should.have.status(200);
          responsePostText = JSON.parse(responsePost.text);
          expect(responsePostText).to.not.be.null;
          expect(responsePostText).to.not.be.undefined;
          responsePostText.should.be.a('boolean');
      }).timeout(30000);
      scheduleApiTest("post api/device/{deviceId}/record/schedule");
      scheduleApiTest("get api/device/{deviceId}/record/schedule");
      scheduleApiTest("delete api/device/{deviceId}/record/schedule");
      it(`get api/device/{deviceId}/record/files`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/record/files?start_time=2000-06-14T06:56:39.545Z&end_time=2100-06-14T06:56:39.545Z`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.undefined;
          if(responseText != null && responseText.length > 0) {
            let keys = new ApiKeys("get api/device/{deviceId}/record/files");
            let keysArr = keys.getApiKeys();
            for(let j = 0; j < keysArr.length; j++) {
              expect(responseText[0]).to.haveOwnProperty(keysArr[j]);
            }
          }
      }).timeout(30000)
    });
    describe('VMS APIs ', () => {
      it(`get api/vst/record/size`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/vst/record/size`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          expect(responseText).to.haveOwnProperty("total")
          expect(responseText.total).to.haveOwnProperty("remaining_storage_days")
          expect(responseText.total).to.haveOwnProperty("size_in_mb")
          if(responseText.hasOwnProperty(cameraId)) {
            expect(responseText[cameraId]).to.haveOwnProperty("size_in_mb")
            expect(responseText[cameraId]).to.haveOwnProperty("state")
          }        
      }).timeout(30000)
      it(`get api/vst/settings`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/vst/settings`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          let keys = new ApiKeys("get api/vms/settings");
          let keysArr = keys.getApiKeys();
          for(let j = 0; j < keysArr.length; j++) {
            expect(responseText).to.haveOwnProperty(keysArr[j]);
          }
      }).timeout(30000)
    })
    describe('Misc APIs ', () => {
      it(`get /api/getLiveStreamUriList`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/getLiveStreamUriList`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('array');
          expect(responseText).to.have.lengthOf.above(0);
          let keys = new ApiKeys("get /api/getLiveStreamUriList");
          let keysArr = keys.getApiKeys();
          for(let j = 0; j < keysArr.length; j++) {
            expect(responseText[0]).to.haveOwnProperty(keysArr[j]);
          }
      }).timeout(30000)
      it(`get /api/getReplayStreamUriList`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/getReplayStreamUriList`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('array');
          expect(responseText).to.have.lengthOf.above(0);
          let keys = new ApiKeys("get /api/getReplayStreamUriList");
          let keysArr = keys.getApiKeys();
          for(let j = 0; j < keysArr.length; j++) {
            expect(responseText[0]).to.haveOwnProperty(keysArr[j]);
          }
      }).timeout(30000)
      it(`get /api/getIceServers`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/getIceServers`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          expect(responseText).to.haveOwnProperty("iceServers")
          responseText.iceServers.should.be.a('array');
          expect(responseText.iceServers).to.have.lengthOf.above(0);
          expect(responseText.iceServers[0]).to.haveOwnProperty("urls")
      }).timeout(30000)
      it(`get /api/version`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/version`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          expect(responseText).to.haveOwnProperty("type");
          expect(responseText).to.haveOwnProperty("version");
      }).timeout(30000)
      it(`get /api/help`, async function () {
        const response = await chai.request(vmsUrl)
        .get(`/api/help`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('array');
          expect(responseText).to.have.lengthOf.above(0);
      }).timeout(30000)
    })
    describe('Live stream test', () => {
      it(`Live Stream Webrtc Calls`, async function () {
        if(typeof window === 'undefined') {
          this.skip()
        }
        toggleVideoDisplay();
        beginConnection();
        await wait(2000);
      }).timeout(30000);
      it(`get /api/stream/status`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        for(let i = 0; i < 30; i ++) {
          const response = await chai.request(vmsUrl)
          .get(`/api/stream/status?peerid=${pc.peerid}`)
            response.should.have.status(200);
            responseText = JSON.parse(response.text);
            expect(responseText).to.not.be.null;
            expect(responseText).to.not.be.undefined;
            responseText.should.be.a('object');
            expect(responseText).to.haveOwnProperty("error")
            expect(responseText).to.haveOwnProperty("state")
            if(responseText.state === "PLAYING") {
              break;
            }
            if(responseText.state !== "PLAYING" && i === 29) {
              expect(responseText.state).to.be.equal("PLAYING");
            }
            await wait(1000);
        }
      }).timeout(50000)
      it(`post /api/stream/stop`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        //total six seconds of playback
        await wait(3000);
        toggleVideoDisplay();
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/stop`)
        .set('content-type', 'application/json')
        .send({peerid: pc.peerid.toString()})
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
      }).timeout(30000);
    })
    describe('Recorded stream test', () => {
      it(`Recording for 30 seconds`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/record`)
        .set('content-type', 'application/json')
        .send({
          'action': 'start'
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
        await wait(1000);
        const responseGet = await chai.request(vmsUrl)
        .get(`/api/device/${cameraId}/record`)
          responseGet.should.have.status(200);
          responseGetText = JSON.parse(responseGet.text);
          expect(responseGetText).to.not.be.null;
          expect(responseGetText).to.not.be.undefined;
          responseGetText.should.be.a('object');
          expect(responseGetText).to.haveOwnProperty("recording_status");
          expect(responseGetText.recording_status).to.to.equal("recording_on_user");
        await wait(29000);
        const responsePost = await chai.request(vmsUrl)
        .post(`/api/device/${cameraId}/record`)
        .set('content-type', 'application/json')
        .send({
          'action': 'stop'
        })
          responsePost.should.have.status(200);
          responsePostText = JSON.parse(responsePost.text);
          expect(responsePostText).to.not.be.null;
          expect(responsePostText).to.not.be.undefined;
          responsePostText.should.be.a('boolean');
      }).timeout(40000);
      it(`Recorded Stream Webrtc Calls`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        toggleVideoDisplay();
        start_time = "2020-06-16T08:02:09.000Z"
        end_time = "2100-06-16T08:02:09.000Z"
        beginConnection();
        await wait(2000);
      }).timeout(30000)
      it(`get /api/stream/status`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        for(let i = 0; i < 30; i ++) {
          const response = await chai.request(vmsUrl)
          .get(`/api/stream/status?peerid=${pc.peerid}`)
            response.should.have.status(200);
            responseText = JSON.parse(response.text);
            expect(responseText).to.not.be.null;
            expect(responseText).to.not.be.undefined;
            responseText.should.be.a('object');
            expect(responseText).to.haveOwnProperty("error")
            expect(responseText).to.haveOwnProperty("state")
            if(responseText.state === "PLAYING") {
              break;
            }
            if(responseText.state !== "PLAYING" && i === 29) {
              expect(responseText.state).to.be.equal("PLAYING");
            }
            await wait(1000);
        }
      }).timeout(50000)
      it(`post /api/stream/seek, +10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_forward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, +10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_forward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, +10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_forward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_backward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_backward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -10`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "seek_backward"
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, 2x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "fast_forward",
          speed: 2
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, 4x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "fast_forward",
          speed: 4
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, 8x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "fast_forward",
          speed: 8
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -2x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "rewind",
          speed: 2
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -4x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "rewind",
          speed: 4
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/seek, -8x`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/seek?peerid=${pc.peerid}`)
        .set('content-type', 'application/json')
        .send({
          peerid: pc.peerid.toString(),
          action: "rewind",
          speed: 8
        })
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`get /api/stream/status`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .get(`/api/stream/status?peerid=${pc.peerid}`)
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('object');
          expect(responseText).to.haveOwnProperty("error")
          expect(responseText).to.haveOwnProperty("state")
          expect(responseText.error).to.be.equal(false);
          expect(responseText.state).to.be.equal("PLAYING")
          await wait(1000);
      }).timeout(10000)
      it(`post /api/stream/pause`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/pause`)
        .set('content-type', 'application/json')
        .send({peerid: pc.peerid.toString()})
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
      }).timeout(10000)
      it(`get /api/stream/status`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        for(let i = 0; i < 30; i ++) {
          const response = await chai.request(vmsUrl)
          .get(`/api/stream/status?peerid=${pc.peerid}`)
            response.should.have.status(200);
            responseText = JSON.parse(response.text);
            expect(responseText).to.not.be.null;
            expect(responseText).to.not.be.undefined;
            responseText.should.be.a('object');
            expect(responseText).to.haveOwnProperty("error")
            expect(responseText).to.haveOwnProperty("state")
            if(responseText.state === "PAUSED") {
              break;
            }
            if(responseText.state !== "PAUSED" && i === 29) {
              expect(responseText.state).to.be.equal("PAUSED");
            }
            await wait(1000);
        }
      }).timeout(50000)
      it(`post /api/stream/resume`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/resume`)
        .set('content-type', 'application/json')
        .send({peerid: pc.peerid.toString()})
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
          await wait(1000);
      }).timeout(10000)
      it(`get /api/stream/status`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        for(let i = 0; i < 30; i ++) {
          const response = await chai.request(vmsUrl)
          .get(`/api/stream/status?peerid=${pc.peerid}`)
            response.should.have.status(200);
            responseText = JSON.parse(response.text);
            expect(responseText).to.not.be.null;
            expect(responseText).to.not.be.undefined;
            responseText.should.be.a('object');
            expect(responseText).to.haveOwnProperty("error")
            expect(responseText).to.haveOwnProperty("state")
            if(responseText.state === "PLAYING") {
              break;
            }
            if(responseText.state !== "PLAYING" && i === 29) {
              expect(responseText.state).to.be.equal("PLAYING");
            }
            await wait(1000);
        }
      }).timeout(50000)
      it(`post /api/stream/stop`, async function () {
        if(typeof window === 'undefined') {
          this.skip();
        }
        toggleVideoDisplay();
        const response = await chai.request(vmsUrl)
        .post(`/api/stream/stop`)
        .set('content-type', 'application/json')
        .send({peerid: pc.peerid.toString()})
          response.should.have.status(200);
          responseText = JSON.parse(response.text);
          expect(responseText).to.not.be.null;
          expect(responseText).to.not.be.undefined;
          responseText.should.be.a('boolean');
      }).timeout(30000);
    })
  })
}

function scheduleApiTest(apiPath) {
  it(apiPath, async function () {
    const response = await chai.request(vmsUrl)
    .post(`/api/device/${cameraId}/record/schedule`)
    .set('content-type', 'application/json')
    .send([
      {
      "start_time":"30 8 * * 1",
      "end_time":"30 10 * * 1"
      },
      {
      "start_time":"30 2 * * 2",
      "end_time":"30 7 * * 2"
      },
    ])
      response.should.have.status(200);
      responseText = JSON.parse(response.text);
      expect(responseText).to.not.be.null;
      expect(responseText).to.not.be.undefined;
      responseText.should.be.a('boolean');

    const res = await chai.request(vmsUrl)
    .post(`/api/device/${cameraId}/record/schedule`)
    .set('content-type', 'application/json')
    .send({
      "start_time":"30 8 * * 6",
      "end_time":"30 10 * * 6"
    })
      res.should.have.status(200);
      resText = JSON.parse(res.text);
      expect(resText).to.not.be.null;
      expect(resText).to.not.be.undefined;
      resText.should.be.a('boolean');
    await wait(1000);
    const responseGet = await chai.request(vmsUrl)
    .get(`/api/device/${cameraId}/record/schedule`)
      responseGet.should.have.status(200);
      responseGetText = JSON.parse(responseGet.text);
      expect(responseGetText).to.not.be.null;
      expect(responseGetText).to.not.be.undefined;
      expect(responseGetText).to.be.a('array');
      expect(responseGetText).to.have.deep.members([{
        "start_time":"30 8 * * 6",
        "end_time":"30 10 * * 6"
        },
        {
        "start_time":"30 8 * * 1",
        "end_time":"30 10 * * 1"
        },
        {
        "start_time":"30 2 * * 2",
        "end_time":"30 7 * * 2"
        }
      ])
    const responseDelete = await chai.request(vmsUrl)
    .delete(`/api/device/${cameraId}/record/schedule`)
    .set('content-type', 'application/json')
    .send([{
        "start_time":"30 8 * * 1",
        "end_time":"30 10 * * 1"
        },
        {
        "start_time":"30 2 * * 2",
        "end_time":"30 7 * * 2"
        },
        {
          "start_time":"30 8 * * 6",
          "end_time":"30 10 * * 6"
        }
      ])
      responseDelete.should.have.status(200);
      responseDeleteText = JSON.parse(responseDelete.text);
      expect(responseDeleteText).to.not.be.null;
      expect(responseDeleteText).to.not.be.undefined;
      responseDeleteText.should.be.a('boolean');
  }).timeout(30000)
}

//get number of iterations from terminal or from index.html.
//Deffault value is one
let itr = 1; 
if(iterations != null) {
  itr = iterations;
}
if(typeof window !== 'undefined') {
  window.updateIterations = function updateIterationsFromHtml(data) {
    itr = parseInt(data);
    mocha.suite.suites = [];
    mocha.suite._bail = false;
    for(var currentIteration = 1; currentIteration <= itr; currentIteration++) {
      console.log("iteration: ", currentIteration);
      vmsTest(currentIteration);
    }
  }
}
else {
  for(var currentIteration = 1; currentIteration <= itr; currentIteration++) {
    vmsTest(currentIteration);
  }
}
if(typeof window !== 'undefined') {
  window.updateCameraId = function updateCameraIdFromHtml(id, user, pass, addCameraIp, addCameraIpUser ,addCameraIpPass, addCameraRtsp, deleteCameraRtsp) {
    cameraId = id.toString();
    camera.username = user.toString();
    camera.password = pass.toString();
    addCameraUsingIp.ip = addCameraIp;
    addCameraUsingIp.username = addCameraIpUser;
    addCameraUsingIp.password = addCameraIpPass;
    addCameraUsingRtsp.url = addCameraRtsp;
    deleteCamera.url = addCameraRtsp;
  }
}
function showToast(msg) {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  // Add the "show" class to DIV
  x.className = "show";
  x.innerHTML = msg;
  // After 5 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 5000);
}

//start of webrtc connection
function beginConnection () {
  axios.get(`${vmsUrl}/api/getIceServers`)
  .then((value) => {
    onGetIceServers(value.data);
  })
  .catch((e) => {
    expect.fail(null, null, e);
    console.log(`Could not fetch ICE servers, `, e);
  });
}

function onGetIceServers (data) {
  iceServers = data;
  createRTCPeerConnection();
  const callurl = `${vmsUrl}/api/stream/start`;
  let jsonData = '';
  earlyCandidates = [];

  pc.createOffer(OFFER_OPTIONS).then((sessionDescription) => {
    pc.setLocalDescription(sessionDescription).then(() => {
      if(start_time !== '') {
        jsonData = {
          startTime : start_time,
          endTime : end_time,
          peerid : pc.peerid.toString(),
          options : {
            rtptransport : "udp",
            timeout : 60,
            overlay : {
              enabled : false,
              objectId : []
            },
            streamId : cameraId
          },
          sensorId : cameraId,
          sessionDescription : sessionDescription
        };
      }
      else {
        jsonData = {
          peerid : pc.peerid.toString(),
          options : {
            rtptransport : "udp",
            timeout : 60,
            streamId : cameraId
          },
          sensorId : cameraId,
          sessionDescription : sessionDescription
        };
      }
      console.log(jsonData);
      axios.post(callurl, jsonData).then(onReceiveCall).catch((e) => {
        expect.fail(null, null, e);
        console.log("failed to start stream, ", e);
      });
    }).catch((e) => {
      console.log("failed to start stream, ", e);
    });
  }).catch((e) => {
    console.log("failed to start stream, ", e);
  });
}

function createRTCPeerConnection () {
  pc = new RTCPeerConnection(iceServers, PEER_CONNECTION_OPTIONS);
  pc.peerid = Math.random();
  pc.onicecandidate = onIceCandidate;
  pc.ontrack = onTrack;
  pc.oniceconnectionstatechange = onIceConnectionStateChange;

  return pc;
}

function onIceCandidate (event) {
  if (event.candidate) {
    if (pc.currentRemoteDescription) {
      addIceCandidate(event.candidate);
    } else {
      earlyCandidates.push(event.candidate);
    }
  }
}

//assigning stream to video element
function onTrack (event) {
  const [stream] = event.streams;
  var vids = document.getElementsByTagName('video') 
  // vids is an HTMLCollection
  for( var i = 0; i < vids.length; i++ ){ 
    vids.item(i).srcObject = stream;
  }
}

function onIceConnectionStateChange () {
  if (pc.iceConnectionState === 'new') {
    getIceCandidate();
  }
}

function onReceiveCall (data) {
  console.log(data.data)
  pc.setRemoteDescription(new RTCSessionDescription(data.data)).then(() => {
    earlyCandidates.forEach(addIceCandidate);
    getIceCandidate();
  });
}

function addIceCandidate (candidate) {
  const jsonData = {
    peerid : pc.peerid.toString(),
    candidate : candidate
  }
  axios.post(`${vmsUrl}/api/addIceCandidate`, jsonData).catch((e) => {
    expect.fail(null, null, e);
  });
}

function getIceCandidate () {
  axios.get(`${vmsUrl}/api/getIceCandidate?peerid=${pc.peerid}`).then(onReceiveCandidate).catch((e) => {
    expect.fail(null, null, e);
    console.log(e.message);
  });
}

function onReceiveCandidate (val) {
  console.log(`candidate: ${JSON.stringify(val.data)}`);
  if (val.data) {
    for (let i = 0; i < val.data.length; i += 1) {
      const candidate = new RTCIceCandidate(val.data[i]);
      console.log(`Adding ICE candidate :${JSON.stringify(candidate)}`);
      pc.addIceCandidate(candidate,
        () => { console.log('addIceCandidate OK'); },
        (error) => { console.log(`addIceCandidate error:${JSON.stringify(error)}`); });
    }
    // this.pc.addIceCandidate();
  }
}
