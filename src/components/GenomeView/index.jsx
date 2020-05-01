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

    initialiseMarkers(configuration, chromosomeCollection, areTracksVisible, additionalTrackHeight) {

        const maxWidthAvailable = configuration.genomeView.width;

        const { isNormalized = false, reversedMarkers } = configuration;
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

            if (isNormalized) {
                // find the marker list that has the maximum width
                maxGeneticWidthMarkerList = _.find(widthCollection, (o) => o.markerId == markerId);
                scaleFactor = (maxWidthAvailable * 0.80) / maxGeneticWidthMarkerList.width;
            }

            // the remaining width is 20% for the maximum width marker list but will change for others
            let remainingWidth = (maxWidthAvailable - (_.find(widthCollection, (o) => o.markerId == markerId).width * scaleFactor)),
                markerPadding = remainingWidth / (chromosomeList.length),
                reversedMarkerList = reversedMarkers[markerId],
                widthUsedSoFar = 0,
                markerList = _.map(chromosomeList, (key) => {
                    let marker = {
                        'data': chromosomeCollection.get(key),
                        'key': key,
                        // if the chromosome key is in the reverse marker list set it here
                        'reversed': (_.findIndex(reversedMarkerList, (d) => d == key) > -1),
                        // marker start point = used space + half marker padding 
                        'x': widthUsedSoFar + (markerPadding / 2),
                        'y': configuration.genomeView.verticalPositions[markerId] + (areTracksVisible ? additionalTrackHeight / 2 : 0),
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

    initialiseLinks(configuration, chromosomeMap, markerPositions, searchResult) {

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

                // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
                linkList.push({
                    source,
                    target,
                    alignment,
                    width: linkWidth,
                    taggedLink: _.findIndex(searchResult, (d) => d.alignmentID == alignment.alignmentID) > -1
                });
            }
        })
        return linkList;
    }

    initialiseTracks(markerPositions, trackType, trackData, showScale) {

        return _.map(trackData, (singleTrackData, trackIndex) => {

            let trackPositions = {}, trackValue;

            _.each(markerPositions, (markerList, markerListId) => {

                let yShifter = (50 * (trackIndex + 1)),
                    interTrackGap = 12 * (trackIndex),
                    interScaleShifter = showScale ? 50 + interTrackGap : 20 + interTrackGap,
                    multiplier = markerListId == 'source' ? -1 * (yShifter + interScaleShifter) : (yShifter - 50 + interScaleShifter);
                _.each(markerList, (marker) => {
                    let tracksPerMarker = _.map(singleTrackData.chromosomeMap[marker.key], (trackDataFragment) => {
                        trackValue = (trackDataFragment.value - singleTrackData.min) / (singleTrackData.max - singleTrackData.min);
                        return {
                            x: ((trackDataFragment.start / marker.data.width) * marker.dx) + marker.x,
                            dx: ((trackDataFragment.end - trackDataFragment.start) / marker.data.width) * marker.dx,
                            dy: (trackType[trackIndex].type == 'track-heatmap') ? 50 : 50 * trackValue,
                            y: marker.y + (multiplier) + ((trackType[trackIndex].type == 'track-heatmap') ? 0 : (50 * (1 - trackValue))),
                            value: trackValue,
                            trackKey: marker.key
                        }
                    });
                    trackPositions[marker.key + '-' + markerListId] = tracksPerMarker;
                });
            });
            return trackPositions;
        })
    }

    initialiseTrackTrails(markerPositions, trackType, trackData, showScale) {

        return _.map(trackData, (ignoreProp, trackIndex) => {

            let trackTrailPostions = [];
            // For heatmap style tracks we dont have y axis trails 
            if (trackType[trackIndex].type == 'track-heatmap') { return false }
            // The track height is hardcoded to 50px so the lines are at 10 ,20,30,40 and 50px respectively 
            else {
                _.each(markerPositions, (markerList, markerListId) => {

                    let yShifter = (50 * (trackIndex + 1)),
                        interTrackGap = 12 * (trackIndex),
                        interScaleShifter = showScale ? 50 + interTrackGap : 20 + interTrackGap,
                        multiplier = markerListId == 'source' ? -1 * (yShifter + interScaleShifter) : (yShifter - 50 + interScaleShifter);

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
        });
    }

    areTracksVisible(configuration, trackData) {
        return (_.reduce(trackData, (acc, d) => (!!d || acc), false) && configuration.showTracks);
    }

    render() {

        const { configuration, genomeData, isDark,
            trackType, searchResult } = this.props,
            { isChromosomeModeON = false, genomeView, showScale } = configuration,
            trackData = _.filter(window.synVisio.trackData, (d) => !!d),
            areTracksVisible = this.areTracksVisible(configuration, trackData),
            additionalTrackHeight = trackData.length * 120;

        const markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap, areTracksVisible, additionalTrackHeight),
            linkPositions = this.initialiseLinks(configuration, genomeData.chromosomeMap, markerPositions, searchResult),
            trackPositions = areTracksVisible ? this.initialiseTracks(markerPositions, trackType, trackData, showScale) : false,
            trackTrailPositions = areTracksVisible ? this.initialiseTrackTrails(markerPositions, trackType, trackData, showScale) : false;

        const trackHeightFix = areTracksVisible ? (trackData.length * 15) : 0;
        const height = genomeView.height - trackHeightFix + (areTracksVisible ? (additionalTrackHeight + (showScale ? 50 : 20)) : 0);

        return (
            <div className='genomeViewRoot' >
                {isChromosomeModeON &&
                    <InlayIcon
                        x={genomeView.width - 50}
                        y={20}
                        onClick={this.resetZoom} />}
                <svg style={{ 'background': isDark ? isChromosomeModeON ? '#1a1c22' : '#252830' : 'white' }}
                    id={'parallel-plot-graphic'}
                    className={'genomeViewSVG exportable-svg ' + (isChromosomeModeON ? 'chrom-mode ' : '') + (areTracksVisible ? 'tracks-visible' : '')}
                    ref={node => this.outerG = node} height={height} width={genomeView.width}>
                    <g ref={node => this.innerG = node} >
                        <Markers areTracksVisible={areTracksVisible} isDark={isDark} configuration={configuration} markerPositions={markerPositions} />
                        <Links isDark={isDark} configuration={configuration} linkPositions={linkPositions} />
                        {areTracksVisible &&
                            _.map(trackPositions, (trackPos, index) =>
                                <Tracks key={'track-sub-' + index}
                                    trackPositions={trackPos}
                                    colorScale={trackType[index].color}
                                    trackType={trackType[index].type} />)}
                        {areTracksVisible &&
                            _.map(trackTrailPositions, (trackTrailPos, index) =>
                                <TrackTrails key={'track-trail-' + index}
                                    trackTrailPositions={trackTrailPos} />)}
                    </g>
                </svg>
            </div >
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        trackType: state.oracle.trackType,
        searchResult: state.oracle.searchResult,
        isDark: state.oracle.isDark
    };
}

export default connect(mapStateToProps)(GenomeView);