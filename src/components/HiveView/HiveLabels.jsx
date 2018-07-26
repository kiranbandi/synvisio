import React, { Component } from 'react';
import radialLink from './radialLink';
import { schemeCategory10 } from 'd3';

export default class HiveLinks extends Component {

    constructor(props) {
        super(props);
    }

    generateLabels() {
        const { markerPositions, position } = this.props, angles = hiveAngles(Object.keys(markerPositions).length);
        return Object.keys(markerPositions).map((markerId) => {
            return (
                <text key={"hive-label-" + markerId}
                    className='hive-label'
                    id={"hive-label-" + markerId}
                    x={position * Math.cos(angles[markerId])}
                    y={position * Math.sin(angles[markerId])}> </text>)

        });
    }


    render() {
        return (
            <g className='hive-label-container'>
                {this.generateLabels()}
            </g>
        );
    }
}
