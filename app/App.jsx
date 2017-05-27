/* @flow */

import React from "react";

import StatusBar from "./StatusBar";
import FrameList from "./FrameList";
import GamepadView from "./GamepadView";

export default class App extends React.Component {
	render(): React.Element<any> {
		return <main>
			<StatusBar />
			<section id="replay">
				<FrameList />
				<GamepadView />
			</section>
		</main>;
	}
}