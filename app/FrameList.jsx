/* @flow */

import React from "react";

type FrameData = {
    ID: int;
    ButtonState: {
        A: bool,
        B: bool,
        X: bool,
        Y: bool,
        Z: bool,
        Rb: bool,
        Lb: bool,
        Start: bool,
        PovN: bool,
        PovW: bool,
        PovE: bool,
        PovS: bool
    },
    ControlStick: {
        X: int,
        Y: int
    },
    CStick: {
        X: int,
        Y: int
    },
    Triggers: {
        L: int,
        R: int
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

export default class FrameList extends React.Component {
    state: {
        frames: FrameData[]
    } = {
        frames: []
    };

    render() {
        return <div className="frameList">
            <nav className="frameMenu">
                <span className="title">Untitled.tas</span>
                <button>Load</button>
                <button disabled={true}>Save</button>
                <button disabled={true}>Save as…</button>
            </nav>
            <div className="frameContainer">
                {this.state.frames.map(frame => <FrameItem key={frame.ID} data={frame} />)}
            </div>
        </div>;
    }
}