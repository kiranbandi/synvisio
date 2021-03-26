import React, { Component } from 'react';
import { MultiHiveView } from '../';
import _ from 'lodash';

export default class MagnumView extends Component {

    render() {

        let { configuration } = this.props;

        let { alignmentList, genomeView, markers } = configuration;

        const matrixSize = 4;

        const horizontalOffset = 1,
            gapWidth = (matrixSize - 1) * horizontalOffset,
            width = (genomeView.width - gapWidth) / 4,
            height = 500;

        const clonedConfiguration = {
            'isBlockModeON': false,
            'isChromosomeModeON': false,
            'isNormalized': true,
            'hiveView': {
                'height': height,
                'width': width,
                'selectedMarker': 2
            },
            'reversedMarkers': { 'source': [], 'target': [] },
            'filterLevel': {}
        };

        const hiveMatrix = _.map(markers, (markerGroup, groupIndex) => {

            const graphConfiguration = {
                ...clonedConfiguration,
                'markers': { ...markerGroup },
                'alignmentList': alignmentList[groupIndex]
            };

            return <MultiHiveView
                sourceTitle={'test'}
                dataAvailable={alignmentList[groupIndex].length > 0}
                key={'multi-hive-' + groupIndex}
                configuration={graphConfiguration} />;

        });


        return (
            <div>
                <div className='anchor-root text-center'>
                    {hiveMatrix}
                </div>
            </div>
        );
    }
}
