import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { select } from 'd3';
import AxisLines from './AxisLines';

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


    render() {

        let { configuration, genomeData } = this.props;
        const side_margin = 25;

        configuration.dotView.width = Math.min(select('#root').node().clientWidth, 500);
        configuration.dotView.innerWidth = configuration.dotView.width - (2 * side_margin);
        configuration.dotView.offset = side_margin;

        let axisLinePositions = this.initialisePostions(configuration, genomeData.chromosomeMap);
        // linkPositions = this.initialiseLinks(configuration, genomeData.chromosomeMap, markerPositions);

        return (
            <div className='genomeViewRoot m-l-md' >
                <svg className='dotViewSVG' height={configuration.dotView.width} width={configuration.dotView.width}>
                    <g>
                        <AxisLines configuration={configuration} axisLinePositions={axisLinePositions} />
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