import React, { Component } from 'react';
import _ from 'lodash';
import {
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateRdBu, interpolatePuOr,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma
} from 'd3';

// create custom color groups
const colorGroup = {
    'red': interpolateReds, 'green': interpolateGreens,
    'blue': interpolateBlues, 'orange': interpolateOranges,
    'viridis': interpolateViridis, 'inferno': interpolateInferno,
    'plasma': interpolatePlasma, 'magma': interpolateMagma,
    'red and blue': interpolateRdBu, 'purple and orange': interpolatePuOr,
    'red,yellow and blue': interpolateRdYlBu, 'red, yellow and green': interpolateRdYlGn
};

export default class Tracks extends Component {

    constructor(props) {
        super(props);
    }

    generateTracks(trackPositions, trackType, color = 'blue') {

        let trackPositionsList = [], customColorScale = colorGroup[color];

        if (trackType == 'track-histogram' || trackType == 'track-heatmap') {
            // convert object to list 
            _.each(trackPositions, (value) => { trackPositionsList.push(...value) });
            return _.map(trackPositionsList, (track, index) => {
                return <rect x={track.x} y={track.y} key={'track-' + index} width={track.dx} height={track.dy} style={{ 'fill': customColorScale(track.value) }}>
                </rect>
            });
        }
        else if (trackType == 'track-scatter') {
            // convert object to list 
            _.each(trackPositions, (value) => { trackPositionsList.push(...value) });
            return _.map(trackPositionsList, (track, index) => {
                return <circle cx={track.x} cy={track.y} key={'track-' + index} r={2.5} style={{ 'fill': customColorScale(0.6) }}>
                </circle>
            });
        }
        // For a line its better to draw a single path for each marker
        else {
            // get d3 line function that returns path
            let d3Line = line().x((d) => d.x).y((d) => d.y);
            return _.map(trackPositions, (value, key) => {
                return <path key={'track-' + key} stroke={customColorScale(0.6)} className='track-line-path' d={d3Line(value)}></path>
            });
        }

    }

    render() {
        const { trackPositions, trackType, colorScale } = this.props,
            trackElements = this.generateTracks(trackPositions, trackType, colorScale);

        return (
            <g className='tracksContainer'>
                {trackElements}
            </g>
        );
    }
}

