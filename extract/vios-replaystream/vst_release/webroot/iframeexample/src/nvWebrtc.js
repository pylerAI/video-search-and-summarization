/*
 * SPDX-FileCopyrightText: Copyright (c) 2024 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-NvidiaProprietary
 *
 * NVIDIA CORPORATION, its affiliates and licensors retain all intellectual
 * property and proprietary rights in and to this material, related
 * documentation and any modifications thereto. Any use, reproduction,
 * disclosure or distribution of this material and related documentation
 * without an express license agreement from NVIDIA CORPORATION or
 * its affiliates is strictly prohibited.
 */

import { postRequest, getRequest, rewriteSdp, generateUUID } from "./nvUtils.js";
import { logError, logInfo } from "./nvLogger.js";
import { initWebSocket } from "./nvWebsocket.js";
import config from "../config.js";

const PEER_CONNECTION_OPTIONS = { optional: [{ DtlsSrtpKeyAgreement: true }] };
let peerConnection = null;
let earlyCandidates = [];
let peerId = null;
let maxBitrate = null;
let minBitrate = null;
let startBitrate = null;
let dialogCreated = false;

export const webrtc = () => {
	const setStreamBitrate = async () => {
		await getRequest(`${config.endpoint}/api/v1/streambridge/configuration`)
			.then((response) => {
				if (response) {
					try {
						minBitrate = response.webrtcMinBirate || 2000;
						maxBitrate = response.webrtcMaxBirate || 10000;
						startBitrate = response.webrtcStartBirate || 4000;
					} catch (error) {
						logError(error);
					}
				}
			})
			.catch((error) => {
				logError("Failed to get streambridge config", error);
			});
	};

	const addIceCandidate = (candidate) => {
		const jsonData = {
			peerId: peerConnection.peerId.toString(),
			candidate,
		};
		logInfo(
			"calling POST: /api/v1/streambridge/iceCandidate with ",
			jsonData
		);
		postRequest(`${config.endpoint}/api/v1/streambridge/iceCandidate`, jsonData)
			.then((response) => {
				logInfo("added ice candidate ?", response);
			})
			.catch((e) => {
				logError("add ice candidate error ", e);
			});
	};

	const onIceCandidate = (event) => {
		if (!event.candidate) {
			logInfo(
				"received null candidate, that means its the last candidate"
			);
			return;
		}
		if (event.candidate) {
			if (event.candidate.candidate.length === 0) {
				logInfo(
					"Recevived empty string for candidate - client is firefox"
				);
				return;
			}
			logInfo(
				"received candidate inside onIceCandidate callback: ",
				event.candidate.candidate
			);
			// If a srflx candidate was found, notify that the STUN server works!
			if (event.candidate.type === "srflx") {
				logInfo(
					"The STUN server is reachable for this candidate!"
				);
				logInfo(`Public IP Address is: ${event.candidate.address}`);
			}
			// If a relay candidate was found, notify that the TURN server works!
			if (event.candidate.type === "relay") {
				logInfo(
					"The TURN server is reachable for this candidate!"
				);
			}
			if (peerConnection && peerConnection.currentRemoteDescription) {
				addIceCandidate(event.candidate);
			} else {
				earlyCandidates.push(event.candidate);
			}
		}
	};

	const onReceiveCandidate = (response) => {
		const candidates = response;
		logInfo(
			`Received candidates from VMS: ${JSON.stringify(candidates)}`
		);
		if (candidates) {
			logInfo(
				"Creating RTCIceCandidate from each received candidate.."
			);
			for (let i = 0; i < candidates.length; i += 1) {
				const candidate = new RTCIceCandidate(candidates[i]);

				logInfo(
					`Adding ICE candidate - ${i} :${JSON.stringify(candidate)}`
				);
				peerConnection.addIceCandidate(
					candidate,
					() => {
						logInfo(`addIceCandidate OK - ${i}`);
					},
					(error) => {
						logInfo(`addIceCandidate error - ${i}`, error);
					}
				);
			}
		}
	};

	const getIceCandidate = () => {
		logInfo("calling GET: /api/v1/streambridge/iceCandidate");
		getRequest(`${config.endpoint}/api/v1/streambridge/iceCandidate?peerId=${peerConnection.peerId}`)
			.then(onReceiveCandidate)
			.catch((e) => {
				logError("getIceCandidate error", e);
			});
	};

	const onIceConnectionStateChange = () => {
		logInfo("ice connection state change: ", peerConnection.iceConnectionState)
		if (peerConnection && peerConnection.iceConnectionState === "new") {
			getIceCandidate();
		}
		if (peerConnection.iceConnectionState === "connected") { }
		if (peerConnection.iceConnectionState === "disconnected") { }
		if (peerConnection.iceConnectionState === "failed") { }
	};

	const onIceGatheringStateChange = () => {
		logInfo("gathering state change: ", peerConnection.iceGatheringState);
	};

	const onSignalingStateChange = () => {
		logInfo("signaling state change: ", peerConnection.signalingState);
	};

	const onConnectionStateChange = () => {
		// FireFox does not support onConnectionStateChange event
		logInfo("connection state change: ", peerConnection.connectionState);
		if (peerConnection.connectionState === "disconnected") {
			logInfo("Lost peer connection...");
		}
	};

	const onIceCandidateError = (e) => {
		logInfo("onIceCandidateError: ", e);
		if (e.errorCode !== 701) {
			logError(
				`${e.errorText} error code ${e.errorCode} and url ${e.url}`,
				"onIceCandidateError"
			);
		}
		if (e.errorCode === 701) {
			logInfo(
				"error code is 701 that means DNS failed for ipv6, harmless error"
			);
		}
	};

	const onTrack = (event) => {
		logInfo("on track called !");
		// eslint-disable-next-line no-shadow
		const [stream] = event.streams;
		// Get the video element by its ID
		const videoElement = document.getElementById('webrtc-video-player');
		if (videoElement) {
			logInfo("adding stream to video element");
			// Update the srcObject property of the video element with the stream
			videoElement.srcObject = stream;
			videoElement.muted = false;
			const playPromise = videoElement.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						logInfo("Autoplay with audio successful");
					})
					.catch((error) => {
						logError("Autoplay with audio failed", error);
						videoElement.muted = true;
						videoElement.play();
					});
			}
			(() => {
				// If dialog is already created, exit
				if (dialogCreated) return;

				// Create a dialog to unmute the video
				const dialog = document.createElement('div');
				dialog.textContent = 'Click to Unmute';
				dialog.style.position = 'absolute';
				dialog.style.top = '50%';
				dialog.style.left = '50%';
				dialog.style.transform = 'translate(-50%, -50%)';
				dialog.style.backgroundColor = '#ffffff';
				dialog.style.padding = '20px';
				dialog.style.cursor = 'pointer';
				dialog.style.borderRadius = '10px';
				dialog.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
				dialog.style.zIndex = '999';
				dialog.style.fontFamily = 'Arial, sans-serif';
				dialog.style.fontSize = '16px';
				dialog.style.color = '#333333';
				dialog.style.textAlign = 'center';
				dialog.style.userSelect = 'none';
				dialog.style.transition = 'background-color 0.3s ease';

				// Hover effect
				dialog.addEventListener('mouseenter', () => {
					dialog.style.backgroundColor = '#f0f0f0';
				});
				dialog.addEventListener('mouseleave', () => {
					dialog.style.backgroundColor = '#ffffff';
				});

				document.body.appendChild(dialog);

				// Add event listener to the dialog
				dialog.addEventListener('click', () => {
					videoElement.muted = false;
					dialog.style.display = 'none'; // Hide the dialog after click
				});

				// Set dialogCreated to true to indicate that the dialog has been created
				dialogCreated = true;
			})();
		}
	};

	const createRTCPeerConnection = (iceServers) => {
		logInfo("ICE Servers: ", iceServers);
		try {
			peerConnection = new RTCPeerConnection(
				{ iceServers },
				PEER_CONNECTION_OPTIONS
			);
			peerConnection.peerId = peerId;
			peerConnection.onicecandidate = onIceCandidate;
			peerConnection.ontrack = onTrack;
			peerConnection.oniceconnectionstatechange = onIceConnectionStateChange;
			peerConnection.onicecandidateerror = onIceCandidateError;
			peerConnection.onicegatheringstatechange = onIceGatheringStateChange;
			peerConnection.onsignalingstatechange = onSignalingStateChange;
			peerConnection.onconnectionstatechange = onConnectionStateChange;
		} catch (error) {
			logError(`Failed to create Avatar RTC peer connection.`, error);
		}
	}

	const negotiateConnection = (data) => {
		if (peerConnection) {
			peerConnection
				.setRemoteDescription(new RTCSessionDescription(data))
				.then(() => {
					logInfo('setRemoteDescription complete, creating answer');
					peerConnection
						.createAnswer()
						.then((sessionDescription) => {
							logInfo('createAnswer complete, setLocalDescription');
							sessionDescription = rewriteSdp(sessionDescription, maxBitrate, minBitrate, startBitrate);
							peerConnection
								.setLocalDescription(sessionDescription)
								.then(() => {
									logInfo('setLocalDescription complete, sendAnswer');
									const answerPayload = {
										sessionDescription: peerConnection.localDescription,
									};
									postRequest(
										`${config.endpoint}/api/v1/streambridge/setAnswer?peerId=${peerConnection.peerId.toString()}`,
										answerPayload
									)
										.then(() => {
											earlyCandidates.forEach(addIceCandidate);
											getIceCandidate();
											logInfo('setAnswer success');
										})
										.catch((e) => {
											logError('setAnswer error: ', e);
										});
								})
								.catch((e) => {
									logError('setLocalDescription error: ', e);
								});
						})
						.catch((e) => {
							logError('createAnswer error: ', e);
						});
				})
				.catch((e) => {
					logError('setRemoteDescription error: ', e);
				});
		}
	};

	const handleSDPOffer = async (msg) => {
		const sdpOffer = JSON.parse(msg);
		if (!sdpOffer) {
			logInfo('Received empty data, skipping');
			return;
		}
		if (!Object.prototype.hasOwnProperty.call(sdpOffer, 'sdp')) {
			logInfo('sdp not present, skipping');
			return;
		}
		if (!Object.prototype.hasOwnProperty.call(sdpOffer, 'streamId')) {
			logInfo('streamId not present, skipping');
			return;
		}
		peerId = sdpOffer.streamId;
		getRequest(`${config.endpoint}/api/v1/streambridge/iceServers?peerId=${peerId}`)
			.then((response) => {
				createRTCPeerConnection(response.iceServers);
				negotiateConnection(sdpOffer);
			})
			.catch((error) => {
				logError('GET request failed:', error);
			});
	}
	const onOpen = async (event) => {
		await setStreamBitrate();
		if (config.enableDummyUDPCall) {
			const peerId = generateUUID();
			const dummyCallJson = {
				peerid: peerId,
				apiKey: 'addDummyUdpTrack',
			};
			logInfo('Sending addDummyUdpTrack to VST');
			websocket.send(JSON.stringify(dummyCallJson));
		}
	}

	const onMessage = (event) => {
		handleSDPOffer(event.data);
	}

	const onError = (event) => { }

	const onClose = (event) => { }

	const websocket = initWebSocket(onOpen, onMessage, onError, onClose);
}

// execute webrtc module on page load
webrtc();
