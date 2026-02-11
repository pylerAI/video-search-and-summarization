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

import { generateUUID } from "./nvUtils.js";
import { logError, logInfo } from "./nvLogger.js";
import config from "../config.js";

export const initWebSocket = (onOpen, onMessage, onError, onClose) => {
	const uuid = generateUUID();
	// construct websocket endpoint
	let websocketEndpoint = "";
	const cleanedEndpoint = config.endpoint.replace(/^https?:\/\//, '');
	if (config.endpoint.includes("https")) {
		websocketEndpoint = `wss://${cleanedEndpoint}/vms/ws?connectionId=${uuid}`
	}
	else {
		websocketEndpoint = `ws://${cleanedEndpoint}/vms/ws?connectionId=${uuid}`
	}
	const socket = new WebSocket(websocketEndpoint);

	// Event listener to handle when the connection is established
	socket.addEventListener('open', function (event) {
		logInfo('WebSocket connection established');
		if (onOpen) {
			onOpen(event); // Call client-provided onOpen callback
		}
	});

	// Event listener to handle incoming messages from the server
	socket.addEventListener('message', function (event) {
		logInfo('Message from server:', event, event.data);
		if (onMessage) {
			onMessage(event); // Call client-provided onMessage callback
		}
	});

	// Event listener to handle any errors that occur with the WebSocket connection
	socket.addEventListener('error', function (event) {
		logError('WebSocket error:', event);
		if (onError) {
			onError(event); // Call client-provided onError callback
		}
	});

	// Event listener to handle when the WebSocket connection is closed
	socket.addEventListener('close', function (event) {
		logInfo('WebSocket connection closed');
		if (onClose) {
			onClose(event); // Call client-provided onClose callback
		}
	});

	// Return the socket object
	return socket;
}
