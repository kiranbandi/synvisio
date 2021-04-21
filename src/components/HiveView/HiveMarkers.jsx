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
        const { markerPositions, configuration } = this.props,
            { colorMap = {} } = configuration,
            angles = hiveAngles(Object.keys(markerPositions).length);

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        return _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let style;

                const colorPalette = isColorMapAvailable ? (colorMap[d.key] || '#1f77b4') : schemeCategory10[i % 10];

                // Add style to elements
                style = { 'strokeWidth': '7px', 'stroke': colorPalette };
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