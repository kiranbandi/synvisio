import React, { Component } from 'react';
import _ from 'lodash';
import { interpolateBlues, line } from 'd3';

export default class DotTracks extends Component {

    constructor(props) {
        super(props);
    }

    generateTracks(trackPositions, trackType) {

        let trackPositionsList = [];

        if (trackType == 'track-histogram' || trackType == 'track-heatmap') {
            // convert object to list 
            _.each(trackPositions, (value) => { trackPositionsList.push(...value) });
            return _.map(trackPositionsList, (track, index) => {
                return <rect x={track.x} y={track.y} key={'track-' + index} width={track.dx} height={track.dy} style={{ 'fill': interpolateBlues(track.value) }}>
                </rect>
            });
        }
        else if (trackType == 'track-scatter') {
            // convert object to list 
            _.each(trackPositions, (value) => { trackPositionsList.push(...value) });
            return _.map(trackPositionsList, (track, index) => {
                return <circle cx={track.x} cy={track.y} key={'track-' + index} r={2.5} style={{ 'fill': interpolateBlues(track.value) }}>
                </circle>
            });
        }
        // For a line its better to draw a single path for each marker
        else {
            // get d3 line function that returns path
            let d3Line = line().x((d) => d.x).y((d) => d.y);
            return _.map(trackPositions, (value, key) => {
                return <path key={'track-' + key} className='track-line-path' d={d3Line(value)}></path>
            });
        }

    }

    render() {
        const { trackPositions, trackType, rotate = false } = this.props,
            trackElements = this.generateTracks(trackPositions, trackType);
        return (
            <g className={'tracksContainer' + (rotate ? ' rotate' : ' ')}>
                {trackElements}
            </g>
        );
    }
}

