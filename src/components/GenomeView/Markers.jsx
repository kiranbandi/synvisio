import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10 } from 'd3';

export default class Markers extends Component {

    constructor(props) {
        super(props);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }

    generateMarkerElements(configuration, markerPositions) {

        let markerElements = [];

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                if (markerListId == 'source') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    stroke = (sourceIndex == -1) ? '#808080' : schemeCategory10[sourceIndex % 10];
                } else {
                    stroke = (i % 2 == 0) ? '#3a3a3a' : 'grey';
                }
                // Add style to elements
                style = {
                    'strokeWidth': '20px',
                    'strokeLinecap': 'round'
                }
                return <line key={markerListId + "-line-" + i}
                    className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                    stroke={stroke}
                    x1={d.x}
                    y1={configuration.genomeView.verticalPositions[markerListId]}
                    x2={d.x + d.dx}
                    y2={configuration.genomeView.verticalPositions[markerListId]}
                    style={style}>
                </line>

            });
            markerElements.push(markerLines);

            // create marker text units
            let markerTextUnits = markerList.map((d, i) => {

                return <text key={markerListId + "-markertext-" + i}
                    className={' markersText marker-text-' + markerListId}
                    x={d.x + (d.dx / 2)}
                    y={configuration.genomeView.verticalPositions[markerListId] + 5}>
                    {d.key}
                </text>


            });
            markerElements.push(markerTextUnits);
        });

        return markerElements;
    }


    render() {

        const { configuration, markerPositions } = this.props;


        const markerElements = this.generateMarkerElements(configuration, markerPositions);

        return (
            <g className='markerContainer' ref={node => this.node = node}>
                {markerElements}
            </g>
        );
    }
}  