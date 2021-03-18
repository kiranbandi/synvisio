import React, { Component } from 'react';
import { MultiGenomeView } from '../';
import _ from 'lodash';

export default class MagnumView extends Component {

    render() {

        let { configuration } = this.props;

        let { alignmentList, genomeView, markers } = configuration;

        const matrixSize = Math.sqrt(markers.length);

        const horizontalOffset = 25, verticalOffset = 15,
            gapWidth = (matrixSize - 1) * horizontalOffset,
            width = (genomeView.width - gapWidth) / matrixSize,
            height = (genomeView.height * 1.1 * 2) / matrixSize;

        const clonedConfiguration = {
            'isBlockModeON': false,
            'isChromosomeModeON': false,
            'genomeView': {
                'height': height,
                'width': width,
                'verticalPositions': {
                    'source': verticalOffset,
                    'target': height - verticalOffset
                }
            },
            'reversedMarkers': { 'source': [], 'target': [] },
            'filterLevel': {}
        };


        const syntenyMatrix = _.map(markers, (markerGroup, groupIndex) => {

            const graphConfiguration = {
                ...clonedConfiguration,
                'markers': { ...markerGroup },
                'alignmentList': alignmentList[groupIndex]
            };

            return <MultiGenomeView
                sourceTitle={graphConfiguration.markers.source[0].slice(0, 2)}
                dataAvailable={alignmentList[groupIndex].length > 0}
                key={'multi-genome-' + groupIndex}
                configuration={graphConfiguration} />;

        });


        return (
            <div>
                <div className='anchor-root text-center'>
                    {syntenyMatrix}
                </div>
            </div>
        );
    }
}
