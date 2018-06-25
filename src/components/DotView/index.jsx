import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import AxisLines from './AxisLines';
import AlignmentLine from './AlignmentLine';

class DotView extends Component {

    constructor(props) {
        super(props);
    }

    initialisePostions(configuration, chromosomeCollection) {

        let maxWidthAvailable = configuration.dotView.innerWidth;

        let maximumWidthX = _.sumBy(configuration.markers.source, (key) => chromosomeCollection.get(key).width),
            maximumWidthY = _.sumBy(configuration.markers.target, (key) => chromosomeCollection.get(key).width);

        let scaleFactorX = maxWidthAvailable / maximumWidthX,
            scaleFactorY = maxWidthAvailable / maximumWidthY

        let posistions = {};
        // more padding on the x axis since the labels are horizontal and need more space to the left of the graph
        let sourceWidthUsedSoFar = configuration.dotView.offset * 2;
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
                'x1': (2 * configuration.dotView.offset),
                'x2': configuration.dotView.innerWidth + (2 * configuration.dotView.offset)
            }
            targetWidthUsedSoFar = targetBit.y2;
            return targetBit;
        });

        return posistions;
    }

    initialiseLines(alignmentList, axisLinePositions, chromosomeCollection) {

        const { genomeLibrary } = window.synVisio;

        return _.map(alignmentList, (alignment) => {

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

            return {
                'x1': first_link_x,
                'x2': last_link_x,
                'y1': first_link_y,
                'y2': last_link_y,
                alignment
            };
        })
    }



    render() {

        let { configuration, genomeData } = this.props;
        const side_margin = 25;

        configuration.dotView.width = Math.min(configuration.dotView.width, 500);
        configuration.dotView.innerWidth = configuration.dotView.width - (2 * side_margin);
        configuration.dotView.offset = side_margin;

        let axisLinePositions = this.initialisePostions(configuration, genomeData.chromosomeMap),
            alignmentLinePositions = this.initialiseLines(configuration.alignmentList, axisLinePositions, genomeData.chromosomeMap);

        return (
            <div className='genomeViewRoot m-l-md' >
                <svg className='dotViewSVG' height={configuration.dotView.width} width={configuration.dotView.width}>
                    <g>
                        <AxisLines configuration={configuration} axisLinePositions={axisLinePositions} />
                        <AlignmentLine alignmentLinePositions={alignmentLinePositions} />
                    </g>
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { configuration: state.oracle.configuration, genomeData: state.genome };
}

export default connect(mapStateToProps)(DotView);