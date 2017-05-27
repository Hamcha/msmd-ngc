/* @flow */

import SerialPort from "serialport";
import EventEmitter from "events";
import { observable } from "mobx";

import type { portConfig } from "serialport";

export type PortType = "nspy" | "msmd";
export type ConnectionStatus = "notconnected" | "connected" | "connecting";

let serialOptions: {[key: PortType]: Object} = {
	nspy: {
		parser: SerialPort.parsers.readline("\n"),
		baudRate: 9600
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

		// Relay events
		this.relayEvents(type, ["open", "close", "data", "error", "disconnect"]);
		
		// Set connected status once opened
		this.devices[type].once("open", () => {
			this.portStatus[type] = "connected";
		});
		// Remove from device list once connection is lost
		this.devices[type].once("close", () => {
			delete(this.devices[type]);
			this.portStatus[type] = "notconnected";
		});
	}

	disconnect(type: PortType) {
		this.devices[type].close();
	}

	relayEvents(type: PortType, events: string[]) {
		events.forEach((event) => this.devices[type].on(event, () => this.emit(event, type, this.devices[type])));
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