import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10 } from 'd3';

export default class HiveMarkers extends Component {

    constructor(props) {
        super(props);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }

    generateMarkerElements(configuration, markerPositions) {

        let markerElements = [];
        const angleFactor = (2 * Math.PI) / Object.keys(configuration.markers).length;

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                let sourceIndex = configuration.markers[markerListId].indexOf(d.key);
                stroke = (sourceIndex == -1) ? '#808080' : schemeCategory10[sourceIndex % 10];
                // Add style to elements
                style = {
                    'strokeWidth': '5px',
                    stroke
                }
                return <line key={markerListId + "-line-" + i}
                    className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                    x1={d.x}
                    y1={0}
                    x2={d.x + d.dx}
                    y2={0}
                    style={style}>
                </line>
            });
            markerElements.push(<g transform={"rotate(" + degrees(angleFactor * markerListId) + ")"} key={"marker-container-" + markerListId}>{markerLines}</g>);
        });

        return markerElements;
    }


    render() {

        const { configuration, markerPositions } = this.props,
            markerElements = this.generateMarkerElements(configuration, markerPositions);

        return (
            <g className='markerContainer'>
                {markerElements}
            </g>
        );
    }
}

function degrees(radians) {
    return radians / Math.PI * 180 - 90;
}