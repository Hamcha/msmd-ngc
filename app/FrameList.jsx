/* @flow */

import React from "react";
import { observer } from "mobx-react";

import DeviceManager from "./DeviceManager";

type Status = "idle" | "playing" | "recording";

type FrameData = {
	ID: number;
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

class FrameItem extends React.Component {
	props: {
		data: FrameData
	}
	render() {
		return <div>{this.props.data.ID}</div>;
	}
}

@observer
export default class FrameList extends React.Component {
	state: {
		frames: FrameData[],
		currentFrame: number,
		status: Status
	} = {
		frames: [],
		currentFrame: -1,
		recording: false,
		status: "idle"
	};

	reset() {
		this.setState({ frames: [], currentFrame: -1 });
	}

	render() {
		let devices = DeviceManager.devices;
		return <div className="frameList">
			<nav className="frameMenu">
				<span className="title">Untitled.tas</span>
				<span className="sep"></span>
				<button><i className="fa fa-folder-open-o" /></button>
				<button disabled={true}><i className="fa fa-save" /></button>
				<span className="sep"></span>
				<button disabled={true}><i className="fa fa-play" /></button>
				<button disabled={true}><i className="fa fa-circle record" /></button>
			</nav>
			<div className="frameContainer">
				{this.state.frames.map(frame => <FrameItem key={frame.ID} data={frame} />)}
			</div>
		</div>;
	}
}