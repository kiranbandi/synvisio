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

        const { configuration, chromosomeMap } = this.props, { markers, treeView, isNormalized = false } = configuration;

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


        _.each(markers, (chromosomeList, markerId) => {

            if (isNormalized) {
                // find the marker list that has the maximum width
                maxGeneticWidthMarkerList = _.find(widthCollection, (o) => o.markerId == markerId);
                scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;
            }


            // the remaining width is 20% for the maximum width marker list but will change for others
            let remainingWidth = (maxWidthAvailable - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
                markerPadding = remainingWidth / (chromosomeList.length),
                widthUsedSoFar = 0;

            let markerList = _.map(chromosomeList, (key) => {
                let marker = {
                    'data': chromosomeMap.get(key),
                    'key': key,
                    // marker start point = used space + half marker padding 
                    'x': widthUsedSoFar + (markerPadding / 2),
                    // width of the marker
                    'dx': (scaleFactor * chromosomeMap.get(key).width),
                    'y': 150 + (markerId * 300),
                    'color': schemeCategory10[colorCount]
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

    initialiseLinks(configuration, chromosomeMap, markerPositions) {

        let linkStore = { links: [], polygons: [] };

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

                        // code for flipping block
                        // 'x': targetMarker.x + targetMarker.dx - targetX,
                        //     'y': targetMarker.y - 10,
                        //         'x1': targetMarker.x + targetMarker.dx - (targetX + targetGeneWidth)

                        var linkConfig = {
                            source: {
                                'x': sourceMarker.x + sourceX,
                                'y': sourceMarker.y + 10,
                                'x1': sourceMarker.x + sourceX + sourceGeneWidth
                            },
                            target: {
                                'x': targetMarker.x + targetX,
                                'y': targetMarker.y - 10,
                                'x1': targetMarker.x + targetX + targetGeneWidth
                            },
                            alignment,
                            width: linkWidth,
                            color: sourceMarker.color
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


    render() {
        const { configuration, chromosomeMap } = this.props, { alignmentList, treeView, markers } = configuration;

        const treeViewHeight = Object.keys(markers).length * 300;
        const markerPositions = (Object.keys(markers).length > 1) && this.initialiseMarkerPositions();
        const linkStore = markerPositions ? this.initialiseLinks(configuration, chromosomeMap, markerPositions) : { links: [], polygons: [] };

        return (
            <div className='treeView-root text-xs-center'>
                <TreeFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
                <AdvancedFilterPanel />
                {alignmentList.length > 0 &&
                    <svg className='treeViewSVG' height={treeViewHeight} width={treeView.width}>
                        <g ref={node => this.innerG = node} >
                            <TreeViewMarkers configuration={configuration} markerPositions={markerPositions} />
                            <TreeViewLinks configuration={configuration} linkStore={linkStore} />
                        </g>
                    </svg>}
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        chromosomeMap: state.genome.chromosomeMap
    };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({}, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);