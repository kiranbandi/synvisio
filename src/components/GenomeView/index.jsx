import React, { Component } from 'react';
import { connect } from 'react-redux';
import Markers from './Markers';
import Links from './Links';
import Tracks from './Tracks';
import TrackTrails from './TrackTrails';
import { InlayIcon } from '../';
import * as d3 from 'd3';

class GenomeView extends Component {

    constructor(props) {
        super(props);
        this.zoom = d3.zoom()
            .scaleExtent([1, 4])
            .filter(() => !(d3.event.type == 'dblclick'))
            .on("zoom", this.zoomed.bind(this));
        this.resetZoom = this.resetZoom.bind(this);
        this.removeZoom = this.removeZoom.bind(this);
        this.attachZoom = this.attachZoom.bind(this);
    }

    componentDidMount() {
        this.attachZoom();
    }
    componentDidUpdate() {
        this.attachZoom();
    }

    attachZoom() {
        if (this.props.configuration.isChromosomeModeON) {
            d3.select(this.outerG)
                .call(this.zoom)
        }
        else {
            this.removeZoom();
        }
    }

    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    removeZoom() {
        this.resetZoom();
        d3.select(this.outerG).on('.zoom', null);
    }

    zoomed() {
        let zoomTransform = d3.event.transform;
        zoomTransform = zoomTransform || { x: 0, y: 0, k: 1 };
        d3.select(this.innerG).attr('transform', 'translate(' + zoomTransform.x + "," + zoomTransform.y + ") scale(" + zoomTransform.k + ")")
    }

    initialiseMarkers(configuration, chromosomeCollection, areTracksVisible) {

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
                markerList = _.map(chromosomeList, (key) => {
                    let marker = {
                        'data': chromosomeCollection.get(key),
                        'key': key,
                        // marker start point = used space + half marker padding 
                        'x': widthUsedSoFar + (markerPadding / 2),
                        'y': configuration.genomeView.verticalPositions[markerId] + (areTracksVisible ? 45 : 0),
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
            if (!configuration.isChromosomeModeON || !alignment.hidden) {
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
                        'y': sourceMarker.y + 10,
                        'x1': sourceMarker.x + sourceX + sourceGeneWidth
                    },
                    target: {
                        'x': targetMarker.x + targetX,
                        'y': targetMarker.y - 10,
                        'x1': targetMarker.x + targetX + targetGeneWidth
                    },
                    alignment,
                    width: linkWidth
                });
            }
        })
        return linkList;
    }

    initialiseTracks(markerPositions, trackType) {
        let trackPositions = {},
            trackValue,
            trackData = window.synVisio.trackData;

        _.each(markerPositions, (markerList, markerListId) => {
            let multiplier = markerListId == 'source' ? -66 : 16;
            _.each(markerList, (marker) => {
                let tracksPerMarker = _.map(trackData.chromosomeMap[marker.key], (trackDataFragment) => {
                    trackValue = (trackDataFragment.value - trackData.min) / (trackData.max - trackData.min);
                    return {
                        x: ((trackDataFragment.start / marker.data.width) * marker.dx) + marker.x,
                        dx: ((trackDataFragment.end - trackDataFragment.start) / marker.data.width) * marker.dx,
                        dy: (trackType == 'track-heatmap') ? 50 : (50 * trackValue),
                        y: marker.y + (multiplier) + ((trackType == 'track-heatmap') ? 0 : (50 * (1 - trackValue))),
                        value: trackValue,
                        trackKey: marker.key
                    }
                });
                trackPositions[marker.key] = tracksPerMarker;
            });
        });
        return trackPositions;

    }

    initialiseTrackTrails(markerPositions, trackType) {
        let trackTrailPostions = [];
        // For heatmap style tracks we dont have y axis trails 
        if (trackType == 'track-heatmap') { return false }
        // The track height is hardcoded to 50px so the lines are at 10 ,20,30,40 and 50px respectively 
        else {
            _.each(markerPositions, (markerList, markerListId) => {
                let multiplier = markerListId == 'source' ? -66 : 16;
                _.each(markerList, (marker) => {
                    for (let looper = 0; looper <= 5; looper++) {
                        trackTrailPostions.push({
                            x: marker.x,
                            dx: marker.dx,
                            y: marker.y + multiplier + (looper * 10)
                        });
                    }
                });
            });
            return trackTrailPostions;
        }
    }

    areTracksVisible(configuration, plotType) {
        return (window.synVisio.trackData && configuration.showTracks && plotType == 'linearplot');
    }

    render() {

        const { configuration, genomeData, plotType, trackType } = this.props,
            { isChromosomeModeON = false, genomeView } = configuration,
            areTracksVisible = this.areTracksVisible(configuration, plotType),
            markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap, areTracksVisible),
            linkPositions = this.initialiseLinks(configuration, genomeData.chromosomeMap, markerPositions),
            trackPositions = areTracksVisible ? this.initialiseTracks(markerPositions, trackType) : false,
            trackTrailPositions = areTracksVisible ? this.initialiseTrackTrails(markerPositions, trackType) : false;

        const height = genomeView.height + (areTracksVisible ? 90 : 0);

        return (
            <div className='genomeViewRoot' >
                {isChromosomeModeON &&
                    <InlayIcon
                        x={genomeView.width - 50}
                        y={20}
                        onClick={this.resetZoom} />}
                <svg className={'genomeViewSVG ' + (isChromosomeModeON ? 'chrom-mode ' : '') + (areTracksVisible ? 'tracks-visible' : '')} ref={node => this.outerG = node} height={height} width={genomeView.width}>
                    <g ref={node => this.innerG = node} >
                        <Markers configuration={configuration} markerPositions={markerPositions} />
                        <Links configuration={configuration} linkPositions={linkPositions} />
                        {areTracksVisible && <Tracks trackPositions={trackPositions} trackType={trackType} />}
                        {trackTrailPositions && <TrackTrails trackTrailPositions={trackTrailPositions} />}
                    </g>
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        trackType: state.oracle.trackType
    };
}

export default connect(mapStateToProps)(GenomeView);