/* @flow */

export type PadStateData = {
	ButtonState: {
		A: boolean,
		B: boolean,
		X: boolean,
		Y: boolean,
		Z: boolean,
		Rb: boolean,
		Lb: boolean,
		Start: boolean,
		PovN: boolean,
		PovW: boolean,
		PovE: boolean,
		PovS: boolean
	},
	ControlStick: {
		X: number,
		Y: number
	},
	CStick: {
		X: number,
		Y: number
	},
	Triggers: {
		L: number,
		R: number
	}
};

function unpackByte(pack: number[]): number {
	return pack.reverse().reduce((n, bitval, i) => n |= (bitval === 0 ? 0 : 1) << i, 0);
}

function parsePacket(packet: number[]): PadStateData {
	return {
		ButtonState: {
			A: packet[7] !== 0,
			B: packet[6] !== 0,
			X: packet[5] !== 0,
			Y: packet[4] !== 0,
			Start: packet[3] !== 0,
			Lb: packet[8] !== 0,
			Rb: packet[10] !== 0,
			Z: packet[11] !== 0,
			PovW: packet[15] !== 0,
			PovE: packet[14] !== 0,
			PovN: packet[12] !== 0,
			PovS: packet[13] !== 0
		},
		ControlStick: {
			X: unpackByte(packet.slice(16, 24)),
			Y: unpackByte(packet.slice(24, 32))
		},
		CStick: {
			X: unpackByte(packet.slice(32, 40)),
			Y: unpackByte(packet.slice(40, 48))
		},
		Triggers: {
			L: unpackByte(packet.slice(48, 56)),
			R: unpackByte(packet.slice(56, 64))
		}
	};
}

export default class PadState {
	ok: boolean = false;
	time: number;
	data: PadStateData;
	_datastr: string = "";

	constructor(packet: number[], time: number) {
		this.time = time;

		// Check for gamepad packets, not requests etc.
		if (packet.length < 64) {
			return;
		}

		this.data = parsePacket(packet);
		this.ok = true;
	}

	toString(): string {
		if (this._datastr !== "") {
			return this._datastr;
		}

		// Serialize button presses
		for (let btn in this.data.ButtonState) {
			if (this.data.ButtonState[btn]) {
				this._datastr += "+" + btn;
			}
		}

		// Serialize all axes
		this._datastr += "," + [this.data.ControlStick.X, this.data.ControlStick.Y, this.data.CStick.X, this.data.CStick.Y, this.data.Triggers.L, this.data.Triggers.R].join(",");

		return this._datastr;
	}
}