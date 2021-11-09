import React, { Component } from 'react';
import _ from 'lodash';

export default class TrackTrails extends Component {

    constructor(props) {
        super(props);
    }

    generateTrackTrails(trackTrailPositions) {
        return _.map(trackTrailPositions, (track, index) => {
            return <line x1={track.x} y1={track.y} x2={track.x + track.dx} y2={track.y} key={'track-' + index} className={'track-trails'}> </line >
        });
    }

    render() {
        const { trackTrailPositions } = this.props;
        return (
            <g className='tracksTrailsContainer'>
                {this.generateTrackTrails(trackTrailPositions)}
            </g>
        );
    }
}

