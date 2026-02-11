/*
* Copyright (c) 2022, NVIDIA CORPORATION.  All rights reserved.
*
* NVIDIA Corporation and its licensors retain all intellectual property
* and proprietary rights in and to this software, related documentation
* and any modifications thereto.  Any use, reproduction, disclosure or
* distribution of this software and related documentation without an express
* license agreement from NVIDIA Corporation is strictly prohibited.
*/

const HOST_NAME = window.location.hostname;
const PORT = window.location.port;
const PROTOCOL = window.location.protocol;
const BASE_URL = PROTOCOL + String("//") + HOST_NAME + String(":") + PORT + String("/api/");

/**
 * populate the camera list after fetching it
 */
function onGetCameraList(cameraList) {
	var select = document.getElementById("selectCamera");
	for(var i = 0; i < cameraList.length; i++) {
    var camera = cameraList[i].name;
    var el = document.createElement("option");
    el.textContent = camera;
    el.value = camera;
    select.appendChild(el);
	}
}

/**
 * fetch the camera list
 */
function getCameraList() {
	window.isRecordedPlayback = false;
	window.startTime = null;
	window.endTime = null;
	window.speed = 1;
	fetch(`${BASE_URL + 'device/list'}`)
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.then(cameraList => {
		if(cameraList == null) {
			simpleToast(`Camera list is empty, please refresh`);
		}
		window.cameraList = cameraList;
		onGetCameraList(cameraList);
	})
	.catch((error) => {
		errorHandler(error);
	});
}

/**
 * if recorded playback selected then show input for start time and end time
 */
function onPlaybackType() {
	var playbackType = document.getElementById("selectPlaybackType").value;
	var element = document.getElementById("recordDetails");
	if (playbackType === "Recorded") {
		element.style.display = "inline";
	}
	else {
		element.style.display = "none";
	}
}

/**
 * update user inputs start time and end time
 */
function onStartTimeChange() {
	var startTime = document.getElementById("startTime").value;
	window.startTime = startTime;
}

function onEndTimeChange() {
	var endTime = document.getElementById("endTime").value;
	window.endTime = endTime;
}

/**
 * Whenver user selects the camera check for its
 * authentication status. If its not authenticated then display
 * a lock icon.
 */
function checkCameraAuth() {
	var selectedCameraName = document.getElementById("selectCamera").value;
	for(let i = 0; i < window.cameraList.length; i++) {
		if(window.cameraList[i].name === selectedCameraName) {
			window.selectedCameraId = window.cameraList[i].id;
			break;
		}
	}
	if(window.selectedCameraId == null) {
		alert("Camera not found");
		return;
	}
	fetch(`${BASE_URL + 'device/status'}`)
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.then(authCameraList => {
		let found = false;
		var lockIcon = document.getElementById("lockIcon");
		for (var cameraId in authCameraList) {
			if (authCameraList.hasOwnProperty(cameraId) && 
					authCameraList[cameraId].error_code === "NoError" && 
					cameraId === window.selectedCameraId) {
				lockIcon.style.display = "none";
				found = true;
				break;
			}
		}
		if(!found) {
			lockIcon.style.display = "inline";
		}
	})
	.catch((error) => {
		errorHandler(error);
	});
}

/**
 * Authenticate selected camera
 */
function onAuthenticate() {
	const jsonPayload = {
		username : document.getElementById("username").value,
		password : document.getElementById("password").value,
	}
	fetch(`${BASE_URL + `device/${window.selectedCameraId}/credentials`}`,{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(jsonPayload),
	})
	.then(response => response.text())
	.then(data => JSON.parse(data))
	.then(isAuthenticated => {
		onCloseModal();
		if(isAuthenticated === true) {
			simpleToast("Camera authenticated");
			var lockIcon = document.getElementById("lockIcon");
			lockIcon.style.display = "none";
		}
		else {
			onCloseModal();
			simpleToast("Failed to authenticated camera !");
		}
	})
	.catch((error) => {
		errorHandler(error);
	});
}

/**
 * enable-disable video controls
 */
function enableVideoControls() {
	var controls = document.getElementsByClassName("video-controls");
	for(var i = 0; i < controls.length; i++) {
		controls[i].disabled = false;
	}
}

function disableVideoControls() {
	var controls = document.getElementsByClassName("video-controls");
	for(var i = 0; i < controls.length; i++) {
		controls[i].disabled = true;
	}
}

function enableDefaultControls() {
	var controls = document.getElementsByClassName("video-controls-always-show");
	for(var i = 0; i < controls.length; i++) {
		controls[i].disabled = false;
	}
}

function disableDefaultControls() {
	var controls = document.getElementsByClassName("video-controls-always-show");
	for(var i = 0; i < controls.length; i++) {
		controls[i].disabled = true;
	}
}

/**
 * simple toast message generator. Toast message displayed for
 * three seconds
 */
function simpleToast(message = "notification message...") {
  var toast = document.getElementById("simpleToast");
  toast.className = "show";
	toast.innerHTML = `<span>${message}</span>`;
  setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
}

/**
 * handle all errors and display toast message
 */
function errorHandler(error) {
	if(error.hasOwnProperty("response") && 
		error.hasOwnProperty("data") && 
		error.hasOwnProperty("error_message")) {
			simpleToast(error.response.data.error_message);
	}
	else {
		simpleToast(error);
	}
}

/**
 * regex to check UTC date format
 */
function isIsoDate(str) {
  if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(str)) return false;
  var d = new Date(str); 
  return d.toISOString()===str;
}

/**
 * fetch camera list once when page loads
 */
getCameraList();