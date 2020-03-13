import React, { Component } from 'react';
import _ from 'lodash';

export default class DotTrackTrails extends Component {

    constructor(props) {
        super(props);
    }

    generateTrackTrails(trackTrailPositions) {
        return _.map(trackTrailPositions, (track, index) => {
            return <line x1={track.x} y1={track.y} x2={track.x + track.dx} y2={track.y} key={'track-' + index} className={'track-trails'}> </line >
        });
    }

    render() {
        const { trackTrailPositions, rotate = false, totalTrackCount = 1 } = this.props;
        return (
            <g className={'tracksTrailsContainer' + (rotate ? ' rotate' : '')}
                style={{ 'transform': rotate ? 'translate(' + magicNumbers[totalTrackCount - 1] + '%,0%) rotate(90deg)' : 'none' }}>
                {this.generateTrackTrails(trackTrailPositions)}
            </g>
        );
    }
}

// These are constant values that seem to work for 4 tracks depending on the size
const magicNumbers = [12, 0, -10, -17];


