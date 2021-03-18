import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10 } from 'd3';
import MarkerText from './MarkerText';

export default class Markers extends Component {

    constructor(props) {
        super(props);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }


    generateMarkerElements(configuration, markerPositions) {

        let markerElements = [], { alignmentColor = 'tenColor' } = configuration;

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                if (markerListId == 'source' && alignmentColor == 'tenColor') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    stroke = (sourceIndex == -1) ? '#808080' : schemeCategory10[sourceIndex % 10];
                } else {
                    stroke = (i % 2 == 0) ? '#3a3a3a' : 'grey';
                }
                // Add style to elements
                style = {
                    'strokeWidth': '20px',
                    stroke
                }
                return <line key={markerListId + "-line-" + i}
                    className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                    x1={d.x}
                    y1={d.y}
                    x2={d.x + d.dx}
                    y2={d.y}
                    style={style}>
                </line>

            });
            markerElements.push(markerLines);

            // if there are any reversed markers
            // add an arrow that is flipped onto the image to indicate it
            let reversedArrows = markerList.map((d, i) => {
                if (d.reversed) {
                    return <path key={'arrow' + i} className='reverse-arrow'
                        d={"M" + (d.x + d.dx) + ' ' + (d.y + 1) +
                            " l-" + (d.dx - 2) + " 0 l15 5 l0 -10 l-15 5"} />
                }
                else return <path key={'arrow' + i} />;
            });

            markerElements.push(reversedArrows);

            // create marker text units
            let markerTextUnits = markerList.map((d, i) => {

                return <MarkerText
                    key={markerListId + "-markertext-outer" + i}
                    outerKey={markerListId + "-markertext-" + i}
                    className={' markersText marker-' + markerListId + "-" + d.key}
                    x={d.x + (d.dx / 2)}
                    y={d.y + 5}
                    text={d.key} />

            });
            markerElements.push(markerTextUnits);
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
