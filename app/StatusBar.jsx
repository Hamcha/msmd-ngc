/* @flow */

import React from "React";
import { observer } from "mobx-react";

import DeviceManager from "./DeviceManager";
import { asyncState } from "./JSXUtils";

import type { PortType, ConnectionStatus } from "./DeviceManager";
import type { portConfig } from "serialport";

type PortData = {
	name: string,
	current: string,
	status: ConnectionStatus
}

function portName(item: portConfig): string {
	return `${item.comName} (${item.manufacturer})`;
}

@asyncState
@observer
export default class StatusBar extends React.Component {
	state: {
		ports: portConfig[],
		refreshing: bool,
		currentNSpyPort: ?string,
		currentMSMDPort: ?string
	} = {
		ports: [],
		refreshing: false,
		currentNSpyPort: null,
		currentMSMDPort: null
	};

	constructor() {
		super();
	}
	componentDidMount() {
		this.refreshPortList();
	}
	async refreshPortList() {
		await this.asyncSetState({ refreshing: true });
		let ports: portConfig[] = await DeviceManager.listPorts();

		// Check if the current port still exists
		let currentNSpyPort = ports.filter(p => p.comName === this.state.currentNSpyPort) ? this.state.currentNSpyPort : null;
		// If we have one or more ports and none was selected so far, auto-select the first result
		if (!currentNSpyPort && ports.length > 0) {
			currentNSpyPort = ports[0].comName;
		}

		let currentMSMDPort = ports.filter(p => p.comName === this.state.currentMSMDPort) ? this.state.currentMSMDPort : null;
		if (!currentMSMDPort && ports.length > 0) {
			currentMSMDPort = ports[0].comName;
		}

		await this.asyncSetState({ ports, currentNSpyPort, currentMSMDPort, refreshing: false });
	}
	setCurrentPort(portType: PortType, currentPort: string) {
		this.setState({ currentPort });
	}
	connect(type: PortType) {
		let path = "";
		switch (type) {
			case "nspy":
				path = this.state.currentNSpyPort;
				break;
			case "msmd":
				path = this.state.currentMSMDPort;
				break;
			default:
				throw "unknown port type: " + type;
		}
		DeviceManager.connect(type, path);
	}
	disconnect(type: PortType) {
		DeviceManager.disconnect(type);
	}
	render(): React.ReactElement<any> {
		let portStatus = DeviceManager.portStatus;
		let ports: {[key: PortType]: PortData} = {
			nspy: {
				name: "NintendoSpy",
				current: this.state.currentNSpyPort,
				status: portStatus.nspy
			},
			msmd: {
				name: "MSMD device (NGC)",
				current: this.state.currentMSMDPort,
				status: portStatus.msmd
			}
		};
		let portBlock = type => {
			let portList = <select disabled={true}><option>No serial devices found</option></select>;

			if (ports[type].status === "notconnected") {
				// Filter out ports that are already being used by other devices
				let available = this.state.ports.filter(port =>
					// For each other port, check if they are connected and using that port name
					Object.values(ports).filter(item => item.current === port.comName && item.status === "connected").length === 0
				);
				
				if (available.length > 0) {
					portList = <select value={ports[type].current} onChange={(e) => this.setCurrentPort(type, e.target.value)}>
						{available.map(item => <option key={item.comName} value={item.comName}>{portName(item)}</option>)}
					</select>;
				}
			} else {
				let activeport = this.state.ports.filter(p => ports[type].current === p.comName)[0];
				portList = <select disabled={true}><option>{portName(activeport)}</option></select>;
			}

			let connectBtn;
			switch (ports[type].status) {
				case "connected":
					connectBtn = <button onClick={this.disconnect.bind(this, type)}>Disconnect</button>;
					break;
				case "connecting":
					connectBtn = <button disabled={true}>Connecting…</button>;
					break;
				case "notconnected":
					connectBtn = <button disabled={ports[type].current === null} onClick={this.connect.bind(this, type)}>Connect</button>;
					break;
				default:
					throw "unknown connection status type: " + ports[type].status;
			}
			return <div className="portBlock">
				<div className="title">{ports[type].name}</div>
				<div className="connectBlock">
					{portList}
					{connectBtn}
				</div>
			</div>;
		};

		return <section id="statusbar">
			{portBlock("nspy")}
			{portBlock("msmd")}
			<div className="right">
				<button onClick={this.refreshPortList.bind(this)} disabled={this.state.refreshing}>
					{this.state.refreshing?"Refreshing…":<span>Refresh<br/>port list</span>}
				</button>
			</div>
		</section>;
	}
}