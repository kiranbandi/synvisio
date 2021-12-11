import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import AxisLines from '../DotView/AxisLines';
import AlignmentLines from '../DotView/AlignmentLines';
import CubeFilterPanel from './CubeFilterPanel';
import AxisLineLabel from '../DotView/AxisLineLabel';
import AdvancedFilterPanel from '../AdvancedFilterPanel';

class DotView extends Component {

    constructor(props) {
        super(props);
    }

    initialisePostions(parameters, chromosomeCollection) {

        var { sourceMarkers, targetMarkers, innerWidth, offset } = parameters;

        let maximumWidthX = _.sumBy(sourceMarkers, (key) => chromosomeCollection.get(key).width),
            maximumWidthY = _.sumBy(targetMarkers, (key) => chromosomeCollection.get(key).width);

        let scaleFactorX = innerWidth / maximumWidthX,
            scaleFactorY = innerWidth / maximumWidthY;


        let positions = {};
        // more padding on the x axis since the labels are horizontal and need more space to the left of the graph
        let sourceWidthUsedSoFar = offset;
        positions.source = _.map(sourceMarkers, (source, index) => {
            let sourceBit = {
                'data': chromosomeCollection.get(source),
                'key': source,
                'x1': sourceWidthUsedSoFar,
                'x2': sourceWidthUsedSoFar + (scaleFactorX * (chromosomeCollection.get(source).width)),
                'y1': offset,
                'y2': innerWidth + offset
            }
            sourceWidthUsedSoFar = sourceBit.x2;
            return sourceBit;
        });

        let targetWidthUsedSoFar = offset;
        positions.target = _.map(targetMarkers, (target, index) => {
            let targetBit = {
                'data': chromosomeCollection.get(target),
                'key': target,
                'y1': targetWidthUsedSoFar,
                'y2': targetWidthUsedSoFar + (scaleFactorY * (chromosomeCollection.get(target).width)),
                'x1': offset,
                'x2': innerWidth + offset
            }
            targetWidthUsedSoFar = targetBit.y2;
            return targetBit;
        });

        return positions;
    }

    initialiseLines(alignmentList, axisLinePositions, chromosomeCollection, alignmentColor) {

        const { genomeLibrary } = window.synVisio, linkList = [],
            isColorByOrientation = alignmentColor == 'orientation';

        _.map(alignmentList, (alignment) => {
            if (!alignment.hidden) {
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
                    'isFlipped': isColorByOrientation ? alignment.type == 'flipped' : false,
                    alignment
                });
            }
        })
        return linkList;
    }


    render() {

        let { configuration, genomeData, isDark, chromosomeMap } = this.props,
            { alignmentList } = configuration;
        const side_margin = 75;

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

        let axisLinePositions = {}, alignmentLinePositions = {};


        if (alignmentList.length > 0) {

            [[0, 1], [1, 2], [2, 0]].map((iterator, index) => {

                axisLinePositions[iterator[0] + ',' + iterator[1]] = this.initialisePostions({ sourceMarkers: configuration.markers[iterator[0]], targetMarkers: configuration.markers[iterator[1]], innerWidth: configuration.dotView.innerWidth, offset: configuration.dotView.offset }, genomeData.chromosomeMap, configuration.alignmentColor);
                alignmentLinePositions[iterator[0] + ',' + iterator[1]] = this.initialiseLines(alignmentList[index].alignmentList, axisLinePositions[iterator[0] + ',' + iterator[1]], genomeData.chromosomeMap, configuration.alignmentColor);

            });

        }


        // reusing hiveview root wrapper name to reuse common filter panel styles
        return (
            <div className='hiveView-root text-xs-center'>
                <CubeFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
                <AdvancedFilterPanel width={configuration.dotView.width} />
                {alignmentList.length > 0 &&
                    <div className={'dotViewWrapper only-dotview'}>
                        <div className={'dotViewRoot threeDcube ' + (isDark ? 'dark' : 'light')}>
                            <svg
                                style={{ 'background': isDark ? '#252830' : 'white' }}
                                className={'dotViewSVG exportable-svg snapshot-thumbnail '}
                                id='3dcube-view-graphic'
                                height={2 * configuration.dotView.width}
                                width={2 * configuration.dotView.width}>

                                {/* XY Plot */}
                                <g style={{ 'transformOrigin': 'center', 'transform': 'translate(48%, -33.5%) skewY(22deg)' }}>
                                    <g style={{ 'transformOrigin': 'center', 'transform': 'rotateX(180deg)' }} >
                                        <rect width={configuration.dotView.width / 1.328} height={configuration.dotView.width / 1.328} style={{ 'transform': 'translate(7%,7%)', 'fill': isDark ? 'rgb(32, 35, 41)' : 'white' }} />
                                        <AxisLines is3D={true} configuration={configuration} axisLinePositions={axisLinePositions['0,1']} />
                                        <AlignmentLines configuration={configuration} alignmentLinePositions={alignmentLinePositions['0,1']} />
                                    </g>
                                </g>

                                {/* YZ Plot */}
                                <g style={{ 'transformOrigin': 'center', 'transform': 'translate(-41%, -33.5%) skewY(-22deg)' }}>
                                    <g style={{ 'transformOrigin': 'center', 'transform': 'rotate(-90deg) rotateX(180deg)' }}>
                                        <rect width={configuration.dotView.width / 1.328} height={configuration.dotView.width / 1.328} style={{ 'transform': 'translate(7%,7%)', 'fill': isDark ? 'rgb(32, 35, 41)' : 'white' }} />
                                        <AxisLines is3D={true} configuration={configuration} axisLinePositions={axisLinePositions['1,2']} />
                                        <AlignmentLines configuration={configuration} alignmentLinePositions={alignmentLinePositions['1,2']} />
                                    </g>
                                </g>


                                {/* XZ Plot */}
                                <g style={{ 'transformOrigin': 'center', 'transform': 'translate(3.5%, 29%)' }}>
                                    <g style={{ 'transformOrigin': 'center', 'transform': 'scale(1.41, 0.57) rotate(135deg) rotateX(180deg)' }}>
                                        <rect width={configuration.dotView.width / 1.328} height={configuration.dotView.width / 1.328} style={{ 'transform': 'translate(7%,7%)', 'fill': isDark ? 'rgb(32, 35, 41)' : 'white' }} />
                                        <AxisLines is3D={true} configuration={configuration} axisLinePositions={axisLinePositions['2,0']} />
                                        <AlignmentLines configuration={configuration} alignmentLinePositions={alignmentLinePositions['2,0']} />
                                    </g>
                                </g>

                                {/* X axis Labels */}
                                <g style={{ 'transform': 'translate(50%, -3%) rotate(22.5deg) scale(1.08, 1)' }}>
                                    {_.map(axisLinePositions['0,1'].source.map((d, i) => {
                                        return <AxisLineLabel className={'special-markers marker-x-lines-text dot-plot-markers marker-x-lines-text-' + d.key}
                                            key={"vertical-line-text-outer-" + d.key}
                                            innerKey={"vertical-line-text-" + d.key}
                                            text={d.key}
                                            style={{ 'fill': isDark ? 'white' : 'black' }}
                                            type='x'
                                            x={d.x1 + ((d.x2 - d.x1) / 2)}
                                            y={d.y1 - 10}
                                        />;
                                    }))}
                                </g>

                                {/* Y axis Labels */}
                                <g style={{ 'transform': 'translate(9%, 64%) rotate(-90deg) scale(1)' }}>
                                    {_.map(axisLinePositions['1,2'].source.map((d, i) => {
                                        return <AxisLineLabel className={'special-markers marker-x-lines-text dot-plot-markers marker-x-lines-text-' + d.key}
                                            key={"vertical-line-text-outer-" + d.key}
                                            innerKey={"vertical-line-text-" + d.key}
                                            text={d.key}
                                            style={{ 'fill': isDark ? 'white' : 'black' }}
                                            type='x'
                                            x={d.x1 + ((d.x2 - d.x1) / 2)}
                                            y={d.y1 - 10}
                                        />;
                                    }))}
                                </g>

                                {/* Z axis Labels */}
                                <g style={{ 'transform': 'translate(60%, 6%) rotate(157.5deg) scale(1.08)' }}>
                                    {_.map(axisLinePositions['2,0'].source.map((d, i) => {
                                        return <AxisLineLabel className={'special-markers marker-x-lines-text dot-plot-markers marker-x-lines-text-' + d.key}
                                            key={"vertical-line-text-outer-" + d.key}
                                            innerKey={"vertical-line-text-" + d.key}
                                            text={d.key}
                                            style={{
                                                'transform': 'rotate(179deg)', 'transformOrigin': 'center',
                                                'fill': isDark ? 'white' : 'black'
                                            }}
                                            type='x'
                                            x={d.x1 + ((d.x2 - d.x1) / 2)}
                                            y={d.y1 - 10}
                                        />;
                                    }))}
                                </g>

                                <defs>
                                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto" markerUnits="strokeWidth">
                                        <path d="M0,0 L0,6 L9,3 z" fill="#f00" />
                                    </marker>
                                </defs>

                                <g style={{ 'transform': 'translate(94%, 61%)' }}>
                                    <g style={{ 'transform': 'rotate(-67.5deg)' }}>
                                        <text style={{ 'fill': isDark ? 'white' : 'rgb(32, 35, 41)', 'transform': 'rotate(93deg) translate(0.5%, 1.5%)', 'transformOrigin': 'inherit' }} className='cube-label'>X axis</text>
                                        <line className="y-axis dot-view-line" x1="0" y1="0" x2="0" y2="50" markerEnd="url(#arrow)"></line>
                                    </g>
                                    <g style={{ 'transform': 'rotate(-180deg)' }}>
                                        <text style={{ 'fill': isDark ? 'white' : 'rgb(32, 35, 41)', 'transform': 'rotate(93deg) translate(0.75%, 1.5%)', 'transformOrigin': 'inherit' }} className='cube-label'>Y axis</text>
                                        <line className="y-axis dot-view-line" x1="0" y1="0" x2="0" y2="50" markerEnd="url(#arrow)"></line>
                                    </g>
                                    <g style={{ 'transform': 'rotate(67.5deg)' }}>
                                        <text style={{ 'fill': isDark ? 'white' : 'rgb(32, 35, 41)', 'transform': 'rotate(270deg) translate(-4%, -1%)', 'transformOrigin': 'inherit' }} className='cube-label'>Z axis</text>
                                        <line className="y-axis dot-view-line" x1="0" y1="0" x2="0" y2="50" markerEnd="url(#arrow)"></line>
                                    </g>
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
        chromosomeMap: state.genome.chromosomeMap,
        isDark: state.oracle.isDark
    };
}

export default connect(mapStateToProps)(DotView);