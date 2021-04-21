import React, { Component } from 'react';
import TreeFilterPanel from './TreeFilterPanel';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';
import TreeViewMarkers from './TreeViewMarkers';
import TreeViewLinks from './TreeViewLinks';
import { schemeCategory10 } from 'd3';
import { AdvancedFilterPanel } from '../';

class TreeView extends Component {

    constructor(props) {
        super(props);
        this.initialiseMarkerPositions = this.initialiseMarkerPositions.bind(this);
    }

    initialiseMarkerPositions() {

        const { configuration, chromosomeMap } = this.props,
            { markers, reversedMarkers, treeView, colorMap = {},
                isNormalized = false, alignmentColor = 'tenColor' } = configuration;

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        const maxWidthAvailable = treeView.width;

        // find the widths for each marker list 
        let widthCollection = _.map(markers, (chromosomeList, markerId) => {
            // for each list we calculate the sum of all the widths of chromosomes in it 
            return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeMap.get(key).width) };
        })

        // find the marker list that has the maximum width
        let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);
        //  we use 90% of the available width for the actual markers and the remaining 10% is used as padding between the markers 
        let scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;

        let markerPositions = {};

        let colorCount = 0;

        let allMarkerIDs = Object.keys(markers);


        _.each(markers, (chromosomeList, markerId) => {

            if (isNormalized) {
                // find the marker list that has the maximum width
                maxGeneticWidthMarkerList = _.find(widthCollection, (o) => o.markerId == markerId);
                scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;
            }


            // the remaining width is 20% for the maximum width marker list but will change for others
            let remainingWidth = (maxWidthAvailable - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
                markerPadding = remainingWidth / (chromosomeList.length),
                widthUsedSoFar = 0,
                reversedMarkerList = reversedMarkers[markerId],
                isThisLastRow = isColorMapAvailable ? false : _.findIndex(allMarkerIDs, (d) => d == markerId) == (allMarkerIDs.length - 1);

            let markerList = _.map(chromosomeList, (key) => {

                const colorPalette = isColorMapAvailable ? (colorMap[key] || '#1f77b4') : schemeCategory10[colorCount];

                let marker = {
                    'data': chromosomeMap.get(key),
                    'key': key,
                    // if the chromosome key is in the reverse marker list set it here
                    'reversed': (_.findIndex(reversedMarkerList, (d) => d == key) > -1),
                    // marker start point = used space + half marker padding 
                    'x': widthUsedSoFar + (markerPadding / 2),
                    // width of the marker
                    'dx': (scaleFactor * chromosomeMap.get(key).width),
                    'y': 150 + (markerId * 300),
                    // for last row using alternating gray pattern if not use colors from d3
                    'color': isThisLastRow || alignmentColor == 'orientation' ? ((colorCount % 2 == 0) ? '#3a3a3a' : 'grey') : colorPalette
                }
                // total width used = previous used space + width + half marker padding
                widthUsedSoFar = marker.x + marker.dx + (markerPadding / 2);
                colorCount = colorCount == 9 ? 0 : colorCount + 1;
                return marker;
            })
            markerPositions[markerId] = markerList;
        })
        return markerPositions;
    }

    initialiseLinks(configuration, chromosomeMap, markerPositions, sourceID) {

        let linkStore = { links: [], polygons: [] },
            { alignmentColor = 'tenColor' } = configuration;

        _.map(configuration.alignmentList, (alignmentDetails) => {

            _.map(alignmentDetails.alignmentList, (alignment) => {
                // only process alignments which are not hidden
                if (!alignment.hidden) {

                    const { genomeLibrary } = window.synVisio;

                    let firstLink = alignment.links[0],
                        lastLink = alignment.links[alignment.links.length - 1];

                    let sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source];
                    let targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target];

                    _.each([0, 1], (value) => {
                        sourceGenes[value] = genomeLibrary.get(sourceGenes[value]).start;
                        targetGenes[value] = genomeLibrary.get(targetGenes[value]).start;
                    })

                    let sourceChromosome = chromosomeMap.get(alignment.source),
                        targetChromosome = chromosomeMap.get(alignment.target);

                    const sourceMarker = _.find(markerPositions[alignmentDetails.source], (o) => o.key == alignment.source),
                        targetMarker = _.find(markerPositions[alignmentDetails.target], (o) => o.key == alignment.target);


                    if (sourceMarker && targetMarker) {
                        let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx),
                            targetGeneWidth = ((targetGenes[1] - targetGenes[0]) / (targetChromosome.width)) * (targetMarker.dx),
                            sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
                            targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
                            // pick the one with the smaller width and ensure the minimum is 2px
                            linkWidth = Math.max(sourceGeneWidth, targetGeneWidth, 2);

                        if (sourceID == 'ancestor-source') {
                            if (sourceGeneWidth == 0) {
                                sourceGeneWidth = sourceMarker.dx;
                            }
                            if (targetGeneWidth == 0) {
                                targetGeneWidth = targetMarker.dx;
                            }
                        }

                        let source, target;
                        if (sourceMarker.reversed) {
                            source = {
                                'x': sourceMarker.x + sourceMarker.dx - sourceX,
                                'y': sourceMarker.y + 10,
                                'x1': sourceMarker.x + sourceMarker.dx - (sourceX + sourceGeneWidth)
                            }
                        }
                        else {
                            source = {
                                'x': sourceMarker.x + sourceX,
                                'y': sourceMarker.y + 10,
                                'x1': sourceMarker.x + sourceX + sourceGeneWidth
                            }
                        }

                        if (targetMarker.reversed) {
                            target = {
                                'x': targetMarker.x + targetMarker.dx - targetX,
                                'y': targetMarker.y - 10,
                                'x1': targetMarker.x + targetMarker.dx - (targetX + targetGeneWidth)
                            }
                        }
                        else {
                            target = {
                                'x': targetMarker.x + targetX,
                                'y': targetMarker.y - 10,
                                'x1': targetMarker.x + targetX + targetGeneWidth
                            }
                        }

                        // code block to straighten links out if they are reversed
                        // when a marker is flipped the links are reversed too and this code block can
                        // straighten them out
                        if (targetMarker.reversed && (target.x > target.x1)) {
                            let tempStore = target.x1;
                            target.x1 = target.x;
                            target.x = tempStore;
                        }
                        if (sourceMarker.reversed && (source.x > source.x1)) {
                            let tempStore = source.x1;
                            source.x1 = source.x;
                            source.x = tempStore;
                        }

                        var linkConfig = {
                            source,
                            target,
                            alignment,
                            width: linkWidth,
                            color: alignmentColor == 'tenColor' ? sourceMarker.color : (alignment.type == 'flipped' ? schemeCategory10[3] : schemeCategory10[0])
                        };

                        // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
                        if (linkWidth == 2) {
                            linkStore.links.push(linkConfig);
                        }
                        else {
                            linkStore.polygons.push(linkConfig);
                        }
                    }
                }
            });
        });
        return linkStore;
    }


    getMarkerTicks(configuration, markerPositions, isDark) {

        let tickElements = [],
            tickColor = isDark ? 'white' : 'darkslategrey',
            lastMarkerListID = Object.keys(markerPositions).length - 1;

        _.map(markerPositions, (markerList, markerListID) => {

            let onesetofticks = _.map(markerList, (marker, markerID) => {
                // the start end and width are all in base pair counts
                let { start, end, width } = marker.data;
                // we first normalise these numbers into million base pairs 
                // or kilo base pairs based on the size
                let normalizer = (width / 1000000) > 0 ? [1000000, 'Mb'] : [1000, 'Kb'],
                    normalizedStart = start / normalizer[0],
                    normalizedEnd = end / normalizer[0],
                    normalizedWidth = width / normalizer[0];

                // We find the number of step ticks we can fit into the marker,
                // a tick element takes 20px so we need to divide the available marker width by that
                let tickWidthInPixels = 30, tickCount = Math.round(marker.dx / tickWidthInPixels),
                    // space between ticks 
                    tickWidthinbp = normalizedWidth / (tickCount);

                let verticalShifter = markerListID == '0' ? -15 : markerListID == lastMarkerListID ? 15 : 15;

                // first we need a base line where the ticks can sit, this runs along
                // the length of the marker
                return <g className='marker-tick-container' key={'marker-tick-wrapper-' + markerID}>
                    <line
                        stroke={tickColor}
                        x1={marker.x} y1={marker.y + verticalShifter}
                        x2={marker.x + marker.dx}
                        y2={marker.y + verticalShifter}> </line>
                    {_.times(tickCount, (tickIndex) => {
                        return <line
                            stroke={tickColor}
                            key={'custom-tick-' + tickIndex}
                            x1={marker.x + (tickIndex * tickWidthInPixels)}
                            x2={marker.x + (tickIndex * tickWidthInPixels)}
                            y1={marker.y + verticalShifter}
                            y2={marker.y + verticalShifter + verticalShifter / 4}>
                        </line>;
                    })}
                    <line
                        stroke={tickColor}
                        key={'custom-tick-' + (tickCount + 1)}
                        x1={marker.x + marker.dx}
                        x2={marker.x + marker.dx}
                        y1={marker.y + verticalShifter}
                        y2={marker.y + verticalShifter + verticalShifter / 4}>
                    </line>

                    {_.times(tickCount, (tickIndex) => {

                        let tickText = String(Math.round(normalizedStart + (tickIndex * tickWidthinbp))),
                            horizontalShifter = tickIndex == 0 ? 5 : tickIndex == tickCount ? -10 : 0;

                        return <text
                            fill={tickColor}
                            key={'custom-ticktext-' + tickIndex}
                            x={marker.x + (tickIndex * tickWidthInPixels - 5) + horizontalShifter}
                            y={marker.y + (2 * verticalShifter) + (verticalShifter > 0 ? 0 : 10)}>
                            {tickText + (tickIndex == tickCount ? ' ' + normalizer[1] : '')}
                        </text>;
                    })}
                    <text
                        fill={tickColor}
                        key={'custom-ticktext-' + (tickCount + 1)}
                        x={marker.x + marker.dx - 10}
                        y={marker.y + (2 * verticalShifter) + (verticalShifter > 0 ? 0 : 10)}>
                        {Math.round((start + width) / normalizer[0]) + ' ' + normalizer[1]}
                    </text>
                </g>
            });

            tickElements.push(onesetofticks);
        });
        return tickElements;
    }


    render() {
        const { configuration, chromosomeMap, isDark, sourceID } = this.props,
            { alignmentList, treeView, markers, showScale = true, markerEdge = 'rounded' } = configuration;

        const treeViewHeight = Object.keys(markers).length * 300;
        const markerPositions = (Object.keys(markers).length > 1) && this.initialiseMarkerPositions();
        const linkStore = markerPositions ? this.initialiseLinks(configuration, chromosomeMap, markerPositions, sourceID) : { links: [], polygons: [] };

        const markerTicks = this.getMarkerTicks(configuration, markerPositions, isDark);
        return (
            <div className='treeView-root text-xs-center'>
                <TreeFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
                <AdvancedFilterPanel width={treeView.width} />
                {alignmentList.length > 0 &&
                    <svg className={'treeViewSVG exportable-svg snapshot-thumbnail ' + (markerEdge == 'square' ? 'remove-cap' : '')}
                        id={'tree-view-graphic'}
                        style={{ 'background': isDark ? '#1a1c22' : 'white' }}
                        height={treeViewHeight} width={treeView.width}>
                        <g ref={node => this.innerG = node} >
                            <TreeViewMarkers configuration={configuration} markerPositions={markerPositions} />
                            <TreeViewLinks configuration={configuration} linkStore={linkStore} />
                            {showScale && markerTicks}
                        </g>
                    </svg>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        chromosomeMap: state.genome.chromosomeMap,
        isDark: state.oracle.isDark,
        sourceID: state.oracle.sourceID
    };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({}, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);