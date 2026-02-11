/*
* Copyright (c) 2022, NVIDIA CORPORATION.  All rights reserved.
*
* NVIDIA Corporation and its licensors retain all intellectual property
* and proprietary rights in and to this software, related documentation
* and any modifications thereto.  Any use, reproduction, disclosure or
* distribution of this software and related documentation without an express
* license agreement from NVIDIA Corporation is strictly prohibited.
*/

const OFFER_OPTIONS = { offerToReceiveAudio: true, offerToReceiveVideo: true };
const PEER_CONNECTION_OPTIONS = { optional: [{ DtlsSrtpKeyAgreement: true }] };

/**
 * start webrtc connection
 */
function beginConnection() {
	if(!window.selectedCameraId) {
		alert("Camera ID not found");
		return;
	}
	var loadingIcon = document.getElementById("loadingIcon");
	loadingIcon.style.display = "flex";
	getIceServers();
}

/**
 * get ICE servers from VST
 */
function getIceServers() {
	fetch(`${BASE_URL + 'getIceServers'}`)
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.then(iceServerList => {
		window.iceServers = iceServerList.iceServers;
		onIceServers();
	})
	.catch((error) => {
		cleanup();
		errorHandler(error);
	});
}

/**
 * on track callback will be called two times. 
 * Once for video and once for audio.
 */
function onTrack(event) {
	const [stream] = event.streams;
	var loadingIcon = document.getElementById("loadingIcon");
	loadingIcon.style.display = "none";
	var videoElement = document.getElementById("webrtcPlayer");
	videoElement.srcObject = stream;
}

/**
 * create new html5 video element for each new webRTC
 * connection. if a video element already exist. Remove stale and create new one.
 */
function createVideoElement() {
	var videoContainer = document.getElementById("videoContainer");
	var videoElement =  document.getElementById('webrtcPlayer');
	if (typeof(videoElement) != 'undefined' && videoElement != null) {
		cleanup();
	}
	var video = document.createElement("video");
	video.autoplay = true;
	video.muted = true;
	video.setAttribute("width", "100%");
	video.setAttribute("height", "100%");
	video.setAttribute("id", "webrtcPlayer");
	video.controls = false;
	videoContainer.appendChild(video);
	var startButton =  document.getElementById('startButton');
	var stopButton =  document.getElementById('stopButton');
	startButton.disabled = true;
	stopButton.disabled = false;
	enableDefaultControls();
}

/**
 * perform cleanup tasks.
 */
function cleanup() {
	try {
		var videoElement = document.getElementById("webrtcPlayer");
		window.pc.close();
		window.pc = null;
		window.earlyCandidates = [];
		window.iceServers = null;
		videoElement.srcObject = null;
		videoElement.remove();
		var stopButton =  document.getElementById('stopButton');
		var startButton =  document.getElementById('startButton');
		var loadingIcon = document.getElementById("loadingIcon");
		loadingIcon.style.display = "none";
		stopButton.disabled = true;
		startButton.disabled = false;
		disableVideoControls();
		disableDefaultControls();
	} catch (error) {
		console.error('Error:', error);
	}
}

/**
 * create RTC peer connection and assign webrtc callbacks
 */
function createRTCPeerConnection() {
	createVideoElement();
	try {
		window.pc = new RTCPeerConnection({ iceServers: window.iceServers }, PEER_CONNECTION_OPTIONS);	
	} catch (error) {
		cleanup();
		return;
	}
	window.pc.peerId = Math.random().toString();
	//required callbacks
	window.pc.onicecandidate = this.onIceCandidate;
	window.pc.ontrack = this.onTrack;
	window.pc.oniceconnectionstatechange = this.onIceConnectionStateChange;

	//optional callbacks
	window.pc.onicecandidateerror = this.onIceCandidateError;
	window.pc.onicegatheringstatechange = this.onIceGatheringStateChange;
	window.pc.onsignalingstatechange = this.onSignalingStateChange;
	window.pc.onconnectionstatechange = this.onConnectionStateChange;
}

/**
 * process received candidates. check if stun and turn servers are working.
 */
function onIceCandidate(event) {
	if(!event.candidate) {
		//received null candidate indicating its the last candidate
		return;
	}
	if (event.candidate) {
		// If a srflx candidate was found, notify that the STUN server works!
		if(event.candidate.type === "srflx") {
			console.log("The STUN server is reachable !");
			console.log(`Public IP Address is: ${event.candidate.address}`);
		}
		// If a relay candidate was found, notify that the TURN server works!
		if(event.candidate.type === "relay") {
			console.log("The TURN server is reachable !");
		}

		/** 
		 * If remote description is present process candidates otherwise
		 * store them in earlyCandidates
		*/
		if (window.pc && window.pc.currentRemoteDescription) {
			window.addIceCandidate(event.candidate);
		} else {
			window.earlyCandidates.push(event.candidate);
		}
	}
}

/**
 * send candidates to VST
 */
function addIceCandidate(candidate) {
	const jsonPayload = {
		peerid : window.pc.peerId,
		candidate : candidate
	}
	fetch(`${BASE_URL + 'addIceCandidate'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

/**
 * get ICE candidates from VST
 */
function getIceCandidate() {
	fetch(`${BASE_URL + `getIceCandidate?peerid=${window.pc.peerId}`}`)
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.then(candidates => {
		onReceiveCandidate(candidates);
	})
	.catch((error) => {
		errorHandler(error);
	});
}

/**
 * for each canidate received from VST create RTC ICE candidate.
 * assign success and failure callbacks to it.
 */
function onReceiveCandidate(candidates) {
	if (candidates) {
		for (let i = 0; i < candidates.length; i += 1) {
			const candidate = new RTCIceCandidate(candidates[i]);
			console.log(`Adding ICE candidate :${i}`);
			window.pc.addIceCandidate(candidate, successCallback, failureCallback);
		}
	}
}

function successCallback() {
	console.log('addIceCandidate OK');
}

function failureCallback(error) {
	console.log(`addIceCandidate error:${JSON.stringify(error)}`);
}

/**
 * process VST's SDP answer. if any early candidates present, use them.
 */
function onReceiveCall(sdpData) {
	if(window.pc.signalingState === "have-local-offer") {
		//Expected signaling state
	}
	else {
		//unexpected signaling state, something went wrong
		simpleToast("unexpected signalingState");
	}
	window.pc.setRemoteDescription(new RTCSessionDescription(sdpData))
	.then(() => {
		window.earlyCandidates.forEach(addIceCandidate);
		getIceCandidate();
	})
	.catch((error) => {
		cleanup();
		errorHandler(error);
	})
}

/**
 * create SDP offer after receiving ICE servers and send it to VST
 */
function onIceServers() {
	createRTCPeerConnection();
	window.earlyCandidates = [];
	window.pc.createOffer(OFFER_OPTIONS).then((sessionDescription) => {
		window.pc.setLocalDescription(sessionDescription).then(() => {
			const jsonPayload = {
				peerid: window.pc.peerId,
				options : {
					quality : "auto",
					rtptransport : "udp",
					timeout : 60,
					streamId : window.selectedCameraId
				},
				sensorId : window.selectedCameraId,
				sessionDescription : sessionDescription
			};
			//add start and end time if present
			if(document.getElementById("selectPlaybackType").value === "Recorded") {
				if(window.startTime != null) {
					jsonPayload.startTime = window.startTime;
					window.isRecordedPlayback = true;
					enableVideoControls();
				}
				if(window.endTime != null) {
					jsonPayload.endTime = window.endTime;
				}
				if(!isIsoDate(window.startTime)) {
					simpleToast("StartTime is not in valid format");
					cleanup();
					return;
				}
				if(!isIsoDate(window.endTime)) {
					simpleToast("endTime is not in valid format");
					cleanup();
					return;
				}
			}
			console.log("jsonPayload: ", jsonPayload)
			fetch(`${BASE_URL + 'stream/start'}`,{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(jsonPayload),
			})
			.then(response => response.text())
			.then(data => JSON.parse(data))
			.then(sdpData => {
				onReceiveCall(sdpData);
			})
			.catch((error) => {
				cleanup();
				errorHandler(error);
			});
		})
	})
	.catch((error) => {
		cleanup();
		errorHandler(error);
	});
}

/**
 * stop peer connection and do cleanup
 */
function stopConnection() {
	const jsonPayload = {
		peerid : window.pc.peerId,
	}
	fetch(`${BASE_URL + 'stream/stop'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
	cleanup();
}

/**
 * callbacks to monitor webrtc states
 */
function onIceConnectionStateChange() {
	if(window.pc) {
		console.log("ice connection state change: ", window.pc.iceConnectionState);
	}
	if (this.pc && this.pc.iceConnectionState === 'new') {
		this.getIceCandidate();
	}
}

function onIceGatheringStateChange() {
	if(window.pc) {
		console.log("gathering state change: ", window.pc.iceGatheringState);
	}
}

function onSignalingStateChange() {
	if(window.pc) {
		console.log("signaling state change: ", window.pc.signalingState);
	}
}

function onConnectionStateChange() {
	if(window.pc) {
		console.log("connection state change: ", window.pc.connectionState);
	}
}

function onIceCandidateError(error) {
	if(error.errorCode !== 701) {
		simpleToast(`${error.errorText} error code ${error.errorCode} and url ${error.url}`);
	}
	if(error.errorCode === 701) {
		//harmless error, DNS failed for ipv6
	}
}

/**
 * video trick modes like fast-forward, rewind, seek video
 * +10 or -10 seconds, play and pause video.
 */
function onPlay() {
	const jsonPayload = {
		peerid : window.pc.peerId,
	}
	var videoElement = document.getElementById("webrtcPlayer");
	videoElement.play();
	if(!window.isRecordedPlayback) {
		return;
	}
	fetch(`${BASE_URL + 'stream/resume'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onPause() {
	const jsonPayload = {
		peerid : window.pc.peerId,
	}
	var videoElement = document.getElementById("webrtcPlayer");
	videoElement.pause();
	if(!window.isRecordedPlayback) {
		return;
	}
	fetch(`${BASE_URL + 'stream/pause'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onFF() {
	window.speed = window.speed >= 1 ? window.speed * 2 : (window.speed === -1 ? 1 : window.speed / 2);
	if(window.speed > 8) {
		window.speed = 8;
	}
	const jsonPayload = {
		peerid : window.pc.peerId,
		action : window.speed >= 1 ? 'fast_forward' : 'rewind',
		seek_value : window.speed
	}
	fetch(`${BASE_URL + 'stream/seek'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onRewind() {
	window.speed = window.speed <= -1 ? window.speed * 2 : (window.speed === 1 ? -1 : window.speed / 2);
	if(window.speed < -8) {
		window.speed = -8;
	}
	const jsonPayload = {
		peerid : window.pc.peerId,
		action : window.speed >= 1 ? 'fast_forward' : 'rewind',
		seek_value : Math.abs(window.speed)
	}
	fetch(`${BASE_URL + 'stream/seek'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onSeekForward() {
	const jsonPayload = {
		peerid : window.pc.peerId,
		action : "seek_forward",
		speed : 1
	}
	fetch(`${BASE_URL + 'stream/seek'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onSeekBackward() {
	const jsonPayload = {
		peerid : window.pc.peerId,
		action : "seek_backward",
		speed : 1
	}
	fetch(`${BASE_URL + 'stream/seek'}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.catch((error) => {
		errorHandler(error);
	});
}

function onVolumeUp() {
	var videoElement = document.getElementById("webrtcPlayer");
	if(videoElement.muted) {
		videoElement.muted = false;
	}
	const newVolume = 0.01 + videoElement.volume * 1.05;
	videoElement.volume = newVolume > 1 ? 1 : newVolume;
}

function onVolumeDown() {
	var videoElement = document.getElementById("webrtcPlayer");
	const newVolume = videoElement.volume * 0.95;
	videoElement.volume = newVolume < 0.1 ? 0 : newVolume;
}
