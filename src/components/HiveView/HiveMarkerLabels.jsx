import React, { Component } from 'react';
import hiveAngles from './hiveAngles';

export default class HiveMarkerLabels extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        const { markerPositions } = this.props, angles = hiveAngles(Object.keys(markerPositions).length);

        let markerTextElements = [];

        _.map(markerPositions, (markerList, markerListId) => {
            // Determine angle based on the markerListID
            const angle = angles[markerListId] - (Math.PI / 2);
            markerList.map((d, i) => {
                markerTextElements.push(
                    <text key={"hive-marker-label-" + markerListId + "-" + i}
                        className='hive-marker-label'
                        x={(d.x + (d.dx / 2)) * Math.cos(angle)}
                        y={(d.x + (d.dx / 2)) * Math.sin(angle)}>
                        {d.key}
                    </text>)
            });

        });


        // to go from polar coordinates to cartesian we use rcos(@) and rsin(@) and we shift the angle by 90 degree
        return (
            <g className='hive-marker-label-container'>
                {markerTextElements}
            </g>
        );
    }
}
