import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10 } from 'd3';
import hiveAngles from './hiveAngles';

export default class HiveMarkers extends Component {

    constructor(props) {
        super(props);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }

    generateMarkerElements() {
        const { markerPositions } = this.props, angles = hiveAngles(Object.keys(markerPositions).length);

        return _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let style;
                // Add style to elements
                style = { 'strokeWidth': '7px', 'stroke': schemeCategory10[i % 10] };
                return (
                    <line key={markerListId + "-line-" + i}
                        className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                        x1={d.x} y1={0} x2={d.x + d.dx} y2={0} style={style}>
                    </line>)
            });

            return (
                <g
                    transform={"rotate(" + degrees(angles[markerListId]) + ")"}
                    key={"marker-container-" + markerListId}>
                    {markerLines}
                </g>);
        });
    }

    render() {
        return (
            <g className='markerContainer'>
                {this.generateMarkerElements()}
            </g>
        );
    }
}

function degrees(radians) {
    return ((radians / Math.PI) * 180) - 90;
}