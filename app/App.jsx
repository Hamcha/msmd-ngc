/* @flow */

import React from "react";

import StatusBar from "./StatusBar";
import FrameList from "./FrameList";

export default class App extends React.Component {
	render(): React.ReactElement<any> {
		return <main>
			<StatusBar />
			<section id="replay">
				<FrameList />
			</section>
		</main>;
	}
}