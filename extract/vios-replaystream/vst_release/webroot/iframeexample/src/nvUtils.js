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

import { logError, logInfo } from "./nvLogger.js";

// Simple UUID generator, replace with better generator if use-case is for cryptographic purposes
export const generateUUID = () => {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0,
			v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

// Function to send a GET request
export const getRequest = async (url) => {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const data = await response.json();
		return data;
	} catch (error) {
		logError('There was a problem with the GET request:', error);
		throw error;
	}
}

// Function to send a POST request
export const postRequest = async (url, data) => {
	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		if (!response.ok) {
			throw new Error('Network response was not ok');
		}
		const responseData = await response.json();
		return responseData;
	} catch (error) {
		logError('There was a problem with the POST request:', error);
		throw error;
	}
}

export const rewriteSdp = (sdp, maxBitrate, minBitrate, startBitrate) => {
	logInfo("Using bitrates: ", maxBitrate, minBitrate, startBitrate);
	const sdpStringFind = 'a=fmtp:(.*) (.*)';
	let sdpStringReplace = null;
	sdpStringReplace = `a=fmtp:$1 $2;x-google-max-bitrate=${maxBitrate};x-google-min-bitrate=${minBitrate};x-google-start-bitrate=${startBitrate}`;
	let newSDP = sdp.sdp.toString();
	newSDP = newSDP.replace(new RegExp(sdpStringFind, 'g'), sdpStringReplace);
	// eslint-disable-next-line no-param-reassign
	sdp.sdp = newSDP;
	logInfo('modified SDP: ', sdp);
	return sdp;
};
