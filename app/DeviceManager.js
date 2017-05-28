/* @flow */

import SerialPort from "serialport";
import EventEmitter from "events";
import { observable } from "mobx";

import type { portConfig } from "serialport";

export type PortType = "nspy" | "msmd";
export type ConnectionStatus = "notconnected" | "connected" | "connecting";

let serialOptions: {[key: PortType]: Object} = {
	nspy: {
		parser: SerialPort.parsers.byteDelimiter([10]),
		baudRate: 115200
	},
	msmd: {
		parser: SerialPort.parsers.readline("\n")
	}
};

class DeviceManager extends EventEmitter {
	@observable portStatus: {[key: PortType]: ConnectionStatus} = {
		"nspy": "notconnected",
		"msmd": "notconnected"
	};
	@observable devices: {[key: PortType]: SerialPort} = {};

	connect(type: PortType, path: string) {
		// Connect and assign to internal array
		this.devices[type] = new SerialPort(path, serialOptions[type]);
		this.portStatus[type] = "connecting";

		// Relay data event
		this.devices[type].on("data", (data) => this.emit("data", type, data, this.devices[type]));
		
		// Set connected status once opened
		this.devices[type].once("open", () => {
			this.portStatus[type] = "connected";
		});
		// Remove from device list once connection is lost
		this.devices[type].once("close", this.deletePort.bind(this, type));
		// Handle errors somehow (TODO replace with an actual solution)
		this.devices[type].once("error", (err) => {
			alert(err);
			this.disconnect(type);
		});
	}

	disconnect(type: PortType) {
		this.devices[type].close();
	}

	deletePort(type: PortType) {
		delete(this.devices[type]);
		this.portStatus[type] = "notconnected";
	}

	// Async util methods
	async listPorts(): Promise<portConfig[]> {
		return new Promise((resolve, reject) => {
			SerialPort.list((err, ports) => {
				if (err) {
					reject(err);
				}
				resolve(ports);
			});
		});
	}
}

export default new DeviceManager();