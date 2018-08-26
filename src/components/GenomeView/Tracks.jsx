import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10, interpolateReds } from 'd3';

export default class Tracks extends Component {

    constructor(props) {
        super(props);
    }


    generateTracks(configuration, trackPositions) {
        return _.map(trackPositions, (track, index) => {
            return <rect x={track.x} y={track.y} key={'track-' + index} width={track.dx} height={10} style={{ 'fill': interpolateReds(track.value) }}>
            </rect>
        });
    }


    render() {

        const { configuration, trackPositions } = this.props,
            trackElements = this.generateTracks(configuration, trackPositions);

        return (
            <g className='tracksContainer'>
                {trackElements}
            </g>
        );
    }
}

