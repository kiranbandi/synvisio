import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import AxisLines from '../DotView/AxisLines';
import AlignmentLines from '../DotView/AlignmentLines';
import CubeFilterPanel from './CubeFilterPanel';

class DotView extends Component {

    constructor(props) {
        super(props);
    }

    initialisePostions(configuration, chromosomeCollection) {

        let maxWidthAvailable = configuration.dotView.innerWidth;

        let maximumWidthX = _.sumBy(configuration.markers.source, (key) => chromosomeCollection.get(key).width),
            maximumWidthY = _.sumBy(configuration.markers.target, (key) => chromosomeCollection.get(key).width);

        let scaleFactorX = maxWidthAvailable / maximumWidthX,
            scaleFactorY = maxWidthAvailable / maximumWidthY;

        let posistions = {};
        // more padding on the x axis since the labels are horizontal and need more space to the left of the graph
        let sourceWidthUsedSoFar = configuration.dotView.offset;
        posistions.source = _.map(configuration.markers.source, (source, index) => {
            let sourceBit = {
                'data': chromosomeCollection.get(source),
                'key': source,
                'x1': sourceWidthUsedSoFar,
                'x2': sourceWidthUsedSoFar + (scaleFactorX * (chromosomeCollection.get(source).width)),
                'y1': configuration.dotView.offset,
                'y2': configuration.dotView.innerWidth + configuration.dotView.offset
            }
            sourceWidthUsedSoFar = sourceBit.x2;
            return sourceBit;
        });

        let targetWidthUsedSoFar = configuration.dotView.offset;
        posistions.target = _.map(configuration.markers.target, (target, index) => {
            let targetBit = {
                'data': chromosomeCollection.get(target),
                'key': target,
                'y1': targetWidthUsedSoFar,
                'y2': targetWidthUsedSoFar + (scaleFactorY * (chromosomeCollection.get(target).width)),
                'x1': configuration.dotView.offset,
                'x2': configuration.dotView.innerWidth + configuration.dotView.offset
            }
            targetWidthUsedSoFar = targetBit.y2;
            return targetBit;
        });

        return posistions;
    }

    initialiseLines(configuration, axisLinePositions, chromosomeCollection) {

        const { genomeLibrary } = window.synVisio, linkList = [];

        _.map(configuration.alignmentList, (alignment) => {
            if (!configuration.isChromosomeModeON || !alignment.hidden) {
                let firstLink = alignment.links[0],
                    lastLink = alignment.links[alignment.links.length - 1];
                let sourceChromosome = chromosomeCollection.get(alignment.source),
                    targetChromosome = chromosomeCollection.get(alignment.target);
                let sourceLinePosition = _.find(axisLinePositions.source, (o) => o.key == alignment.source),
                    targetLinePosition = _.find(axisLinePositions.target, (o) => o.key == alignment.target);

                let first_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(firstLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
                let last_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(lastLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
                let first_link_y = targetLinePosition.y1 + ((genomeLibrary.get(firstLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);
                let last_link_y = targetLinePosition.y1 + ((genomeLibrary.get(lastLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);

                linkList.push({
                    'x1': first_link_x,
                    'x2': last_link_x,
                    'y1': first_link_y,
                    'y2': last_link_y,
                    alignment
                });
            }
        })
        return linkList;
    }


    render() {

        let { configuration, genomeData, chromosomeMap } = this.props,
            { alignmentList } = configuration;
        const side_margin = 57.5;

        configuration = {
            ...configuration,
            dotView: {
                ...configuration.dotView,
                width: configuration.dotView.width,
                innerWidth: configuration.dotView.width - (2 * side_margin),
                offset: side_margin
            },
            markers: Object.keys(configuration.markers).length < 3 ? { 0: [], 1: [], 2: [] } : configuration.markers
        }

        let axisLinePositions, alignmentLinePositions;

        if (alignmentList.length > 0) {
            axisLinePositions = this.initialisePostions(configuration, genomeData.chromosomeMap);
            alignmentLinePositions = this.initialiseLines(configuration, axisLinePositions, genomeData.chromosomeMap);
        }

        // reusing hiveview root wrapper name to reuse common filter panel styles
        return (
            <div className='hiveView-root text-xs-center'>
                <CubeFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
                {alignmentList.length > 0 &&
                    <div className={'dotViewWrapper only-dotview'}>
                        <div className='dotViewRoot'>
                            <svg
                                className={'dotViewSVG'}
                                height={configuration.dotView.width}
                                width={configuration.dotView.width}>
                                <g>
                                    <AxisLines configuration={configuration} axisLinePositions={axisLinePositions} />
                                    <AlignmentLines configuration={configuration} alignmentLinePositions={alignmentLinePositions} />
                                </g>
                            </svg>
                        </div>
                    </div>}

            </div>

        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        trackType: state.oracle.trackType,
        chromosomeMap: state.genome.chromosomeMap
    };
}

export default connect(mapStateToProps)(DotView);