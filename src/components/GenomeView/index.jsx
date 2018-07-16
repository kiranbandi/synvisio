import React, { Component } from 'react';
import { connect } from 'react-redux';
import Markers from './Markers';
import Links from './Links';

class GenomeView extends Component {

    constructor(props) {
        super(props);
    }

    initialiseMarkers(configuration, chromosomeCollection) {

        const maxWidthAvailable = configuration.genomeView.width;
        // To arrange the markers in a proper way we find the marker List that has the maximum genome width
        //  We need this to fit in the maximum available width so we use this and find the scale factor 
        // we then fit all the other markers using the same scale factors
        // this way the chromosome width ratio is maintainer across all the marker list while at the same time they are
        //  fit relative to the webpage width

        // find the widths for each marker list 
        let widthCollection = _.map(configuration.markers, (chromosomeList, markerId) => {
            // for each list we calculate the sum of all the widths of chromosomes in it 
            return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeCollection.get(key).width) };
        })

        // find the marker list that has the maximum width
        let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);

        //  we use 90% of the available width for the actual markers and the remaining 10% is used as padding between the markers 
        let scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;

        // no we initialise the markers and set the width directly on the markers lists directly 
        let markers = {};
        _.each(configuration.markers, (chromosomeList, markerId) => {
            // the remaining width is 20% for the maximum width marker list but will change for others
            let remainingWidth = (maxWidthAvailable - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
                markerPadding = remainingWidth / (chromosomeList.length),
                widthUsedSoFar = 0,
                markerList = _.map(chromosomeList, (key, index) => {
                    let marker = {
                        'data': chromosomeCollection.get(key),
                        'key': key,
                        // marker start point = used space + half marker padding 
                        'x': widthUsedSoFar + (markerPadding / 2),
                        // width of the marker
                        'dx': (scaleFactor * chromosomeCollection.get(key).width)
                    }
                    // total width used = previous used space + half marker padding + width + end marker padding
                    widthUsedSoFar = marker.x + marker.dx + (markerPadding / 2);
                    return marker;
                })
            markers[markerId] = markerList;
        })
        return markers;
    }

    initialiseLinks(configuration, chromosomeMap, markerPositions) {

        const linkList = [];

        _.map(configuration.alignmentList, (alignment) => {

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

                let sourceMarker = _.find(markerPositions.source, (o) => o.key == alignment.source),
                    targetMarker = _.find(markerPositions.target, (o) => o.key == alignment.target);

                let sourceGeneWidth = ((sourceGenes[1] - sourceGenes[0]) / (sourceChromosome.width)) * (sourceMarker.dx),
                    targetGeneWidth = ((targetGenes[1] - targetGenes[0]) / (targetChromosome.width)) * (targetMarker.dx),
                    sourceX = ((sourceGenes[0] - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
                    targetX = ((targetGenes[0] - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
                    // pick the one with the smaller width and ensure the minimum is 2px
                    linkWidth = Math.max(sourceGeneWidth, targetGeneWidth, 2);

                // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
                linkList.push({
                    source: {
                        'x': sourceMarker.x + sourceX,
                        'y': configuration.genomeView.verticalPositions.source + 10,
                        'x1': sourceMarker.x + sourceX + sourceGeneWidth
                    },
                    target: {
                        'x': targetMarker.x + targetX,
                        'y': configuration.genomeView.verticalPositions.target - 10,
                        'x1': targetMarker.x + targetX + targetGeneWidth
                    },
                    alignment,
                    width: linkWidth
                });
            }
        })

        return linkList;
    }

    render() {

        const { configuration, genomeData } = this.props,
            markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap),
            linkPositions = this.initialiseLinks(configuration, genomeData.chromosomeMap, markerPositions);

        return (
            <div className='genomeViewRoot' >
                <svg className='genomeViewSVG' height={configuration.genomeView.height} width={configuration.genomeView.width}>
                    <Markers configuration={configuration} markerPositions={markerPositions} />
                    <Links configuration={configuration} linkPositions={linkPositions} />
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { genomeData: state.genome };
}

export default connect(mapStateToProps)(GenomeView);