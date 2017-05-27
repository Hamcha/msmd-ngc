import EventEmitter from "events";

declare module "serialport" {
	declare export type portConfig = {
		comName: string,
		manufacturer: string,
		serialNumber: string,
		pnpId: any,
		locationId: string,
		vendorId: string,
		productId: string
	};
	declare export type options = {
		autoOpen: ?boolean,
		lock: ?boolean,
		baudRate: ?number,
		dataBits: ?number,
		stopBits: ?number,
		parity: ?string,
		rtscts: ?boolean,
		xon: ?boolean,
		xoff: ?boolean,
		bufferSize: ?number,
		parser: any,
		platformOptions: ?Object
	};
	declare export default class SerialPort extends EventEmitter {
		constructor(path: string, options: options): SerialPort;
		static parsers: {[key: string]: any};
	}
}