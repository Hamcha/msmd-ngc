/* @flow */

import SerialPort from "serialport";
import EventEmitter from "events";

import type { portConfig } from "serialport";

export type PortType = "nspy" | "msmd";

let instance: ?DeviceManager = null;

let serialOptions: {[key: PortType]: Object} = {
	nspy: {
		parser: SerialPort.parsers.readline("\n"),
		baudRate: 9600
	},
	msmd: {
		parser: SerialPort.parsers.readline("\n")
	}
};

export default class DeviceManager extends EventEmitter {
	static get instance() {
		if (instance === null) {
			instance = new DeviceManager();
		}
		return instance;
	}
	static async listPorts(): Promise<portConfig[]> {
		return new Promise((resolve, reject) => {
			SerialPort.list((err, ports) => {
				if (err) {
					reject(err);
				}
				resolve(ports);
			});
		});
	}
	devices: {[key: PortType]: SerialPort} = {};
	connect(type: PortType, path: string) {
		this.devices[type] = new SerialPort(path, serialOptions[type]);
		this.relayEvents(type, "open");
		this.relayEvents(type, "data");
		this.relayEvents(type, "close");
		this.relayEvents(type, "error");
		this.relayEvents(type, "disconnect");
	}
	disconnect(type: PortType) {
		this.devices[type].close();
	}
	relayEvents(type, event) {
		this.devices[type].on(event, () => this.emit(event, type, this.devices[type]));
	}
}