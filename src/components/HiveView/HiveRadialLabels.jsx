import React, { Component } from 'react';
import hiveAngles from './hiveAngles';

export default class HiveRadialLabels extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { markerPositions, onMarkerSelect } = this.props, angles = hiveAngles(Object.keys(markerPositions).length);

        const elements = Object.keys(markerPositions).map((markerId) => {

            const lastElement = markerPositions[markerId].slice(-1)[0],
                radius = lastElement ? (lastElement.x + lastElement.dx) : 0;

            return (
                <text key={"hive-label-" + markerId}
                    className='hive-label' id={"hive-label-" + markerId}
                    x={(radius + 20) * Math.cos(angles[markerId] - (Math.PI / 2))}
                    y={(radius + 20) * Math.sin(angles[markerId] - (Math.PI / 2))}
                    onClick={onMarkerSelect}>
                    {Number(markerId) + 1}
                </text>)
        });

        // to go from polar coordinates to cartesian we use rcos(@) and rsin(@) and we shift the angle by 90 degree
        return (
            <g className='hive-radial-label-container'>
                {elements}
            </g>
        );
    }
}
