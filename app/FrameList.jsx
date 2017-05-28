/* @flow */

import React from "react";
import { observer } from "mobx-react";

import DeviceManager from "./DeviceManager";
import PadState from "./PadState";

import type SerialPort from "serialport";
import type { PortType } from "./DeviceManager";

type Status = "idle" | "playing" | "recording";

function hrdate(time: number): string {
	return time + "ms";
}

function knob(data: { X: number, Y: number }): React.Element<any> {
	let style = {
		left: ((data.X/256 * 20)-5) + "px",
		top: ((data.Y/256 * 20)-5) + "px"
	};
	return <div className="knob" style={style}></div>;
}

class FrameItem extends React.Component {
	props: {
		data: PadState
	}
	render() {
		let time = hrdate(this.props.data.time);
		let data = this.props.data.data;
		let buttonInfo = [
			{ name: "A", status: data.ButtonState.A },
			{ name: "B", status: data.ButtonState.B },
			{ name: "X", status: data.ButtonState.X },
			{ name: "Y", status: data.ButtonState.Y },
			{ name: "St", status: data.ButtonState.Start },
			{ name: "Z", status: data.ButtonState.Z }
		];
		let axisInfo = [
			{ type: "controlstick", status: data.ControlStick },
			{ type: "cstick", status: data.CStick }
		];
		let triggerInfo = [
			{ name: "L", button: data.ButtonState.Lb, axis: data.Triggers.L },
			{ name: "R", button: data.ButtonState.Rb, axis: data.Triggers.R }
		];
		let buttons = buttonInfo.map(btn => <div key={btn.name} className={btn.status?"btn pressed":"btn"}>{btn.name}</div>);
		let axes = axisInfo.map(ax => <div key={ax.type} className={ax.type + " axis"}>{knob(ax.status)}</div>);
		let triggers = triggerInfo.map(tr => <div key={tr.name} className={tr.status?"trigger pressed":"trigger"}>{tr.name}</div>);
		return <div className="frameItem">
			<div className="date">{time}</div>
			<div className="btndata">
				{buttons}
				{axes}
				{triggers}
			</div>
		</div>;
	}
}

@observer
export default class FrameList extends React.Component {
	state: {
		frames: PadState[],
		currentFrame: number,
		status: Status,
		recordStart: number
	} = {
		frames: [],
		currentFrame: -1,
		status: "idle",
		recordStart: 0
	};

	recordedFrames: PadState[] = [];

	reset() {
		this.setState({ frames: [], currentFrame: -1 });
	}

	componentDidMount() {
		DeviceManager.on("data", this.parseData.bind(this));
	}

	parseData(type: PortType, data: number[], dev: SerialPort) {
		switch (this.state.status) {
			case "recording":
				this.handleNspyLine(data);
				break;
			case "playing":
				this.handleMSMDRequest(data, dev);
				break;
			default:
		}
	}

	handleNspyLine(data: number[]) {
		let frameData = new PadState(data, Date.now()-this.state.recordStart);
		// Only push if successfully parsed
		if (!frameData.ok) {
			return;
		}
		// Only push if different than previous frame
		if (this.recordedFrames.length === 0 || frameData.toString() !== this.recordedFrames[this.recordedFrames.length-1].toString()) {
			this.recordedFrames.push(frameData);
		}
		if (this.recordedFrames.length % 100 === 0) {
			console.log(`Recorded ${this.recordedFrames.length} frames`);
		}
	}

	handleMSMDRequest(data: number[], dev: SerialPort) {

	}

	togglePlay() {
		this.setState({ status: this.state.status === "playing" ? "idle" : "playing" });
	}

	toggleRecord() {
		if (this.state.status !== "recording") {
			this.setState({
				status: "recording",
				recordStart: this.state.frames.length === 0 ? Date.now() : this.state.recordStart // Set if starting from scratch
			});
		} else {
			// Drop the first recorded frame (usually unusable)
			this.recordedFrames.shift();

			// If stopped recording, add the recorded frames on top of the current ones
			this.setState({ status: "idle", frames: this.state.frames.concat(this.recordedFrames) });

			// Reset uncommitted frames
			this.recordedFrames = [];
		}
	}

	clearFrames() {
		this.setState({ status: "idle", frames: [] });
	}

	render() {
		let status = DeviceManager.portStatus;
		return <div className="frameList">
			<nav className="frameMenu">
				<span className="title">Untitled.tas</span>
				<span className="sep"></span>
				<button><i className="fa fa-folder-open-o" /></button>
				<button disabled={true}><i className="fa fa-save" /></button>
				<button onClick={this.clearFrames.bind(this)} disabled={this.state.frames.length < 1}><i className="fa fa-trash" /></button>
				<span className="sep"></span>
				<button onClick={this.togglePlay.bind(this)} disabled={status.msmd !== "connected"}><i className={this.state.status === "playing" ? "fa fa-stop" : "fa fa-play"} /></button>
				<button onClick={this.toggleRecord.bind(this)} disabled={status.nspy !== "connected"}><i className={this.state.status === "recording" ? "fa fa-stop record" : "fa fa-circle record"} /></button>
			</nav>
			<div className={`frameContainer fc_${this.state.status}`}>
				{this.state.frames.map((frame, i) => <FrameItem key={i} data={frame} />)}
			</div>
		</div>;
	}
}