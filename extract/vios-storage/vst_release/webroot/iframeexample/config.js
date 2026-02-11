// Edit below fields to configure the web app
const config = {
	endpoint: null || `${window.location.protocol}//${window.location.host}`, // replace null with your endpoint like "http://ip:port"
	enableLogs: true, // enable-disable console logs
	enableDummyUDPCall: false // to send dummy UDP track on websocket, its for debug purpose
};

export default config;
