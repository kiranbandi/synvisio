import React, { Component } from 'react';
import { connect } from 'react-redux';
import Markers from './Markers';
import Links from './Links';
import Tracks from '../LinkageView/Tracks';
import TrackTrails from './TrackTrails';
import {
    scaleLinear, interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma
} from 'd3';

import HetLegend from './HetLegend';
import DistortionLegend from './DistortionLegend';

const dynamicColorScale = interpolateYlGnBu;

class LinkageView extends Component {

    initialiseMarkers(configuration, chromosomeCollection, areTracksVisible, additionalTrackHeight) {

        const maxWidthAvailable = configuration.genomeView.width;

        const { isNormalized = false, reversedMarkers } = configuration;


        let verticalPositions = { ...configuration.genomeView.verticalPositions };

        verticalPositions['source'] = 0;


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
                        'y': verticalPositions[markerId] + (areTracksVisible ? additionalTrackHeight / 2 : 0),
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

    initialiseLinks(chromosomeMap, markerPositions, linkageData) {

        const linkList = [];

        _.map(linkageData, (alignment) => {

            const hetScores = linkageData.map((d) => +d.het);

            let colorScale = scaleLinear()
                .domain([_.min(hetScores), _.max(hetScores)])
                .range([0.3, 0.8]);


            let sourceChromosome = chromosomeMap.get(alignment.locus),
                targetChromosome = chromosomeMap.get(alignment.linkageID);

            let sourceMarker = _.find(markerPositions.source, (o) => o.key == alignment.locus),
                targetMarker = _.find(markerPositions.target, (o) => o.key == alignment.linkageID);

            let sourceGeneWidth = 1,
                targetGeneWidth = 1,
                sourceX = ((+alignment.position - sourceChromosome.start) / (sourceChromosome.width)) * (sourceMarker.dx),
                targetX = ((alignment.distance - targetChromosome.start) / (targetChromosome.width)) * (targetMarker.dx),
                // pick the one with the smaller width and ensure the minimum is 2px
                linkWidth = Math.max(sourceGeneWidth, targetGeneWidth, 2);


            let source, target;

            source = {
                'x': sourceMarker.x + sourceX,
                'y': sourceMarker.y,
                'x1': sourceMarker.x + sourceX + sourceGeneWidth
            }

            target = {
                'x': targetMarker.x + targetX,
                'y': targetMarker.y - 10,
                'x1': targetMarker.x + targetX + targetGeneWidth
            }

            // the marker height is 10 px so we add and reduce that to the y postion for top and bottom
            linkList.push({
                source,
                target,
                alignment,
                color: dynamicColorScale(colorScale(alignment.het)),
                width: linkWidth
            });

        })

        return linkList;
    }


    initialiseTracks(markerPositions, trackType, trackData, showScale) {

        const moddedMarkerPositions = { 'target': markerPositions.target };

        return _.map(trackData, (singleTrackData, trackIndex) => {

            let trackPositions = {}, trackValue;

            _.each(moddedMarkerPositions, (markerList, markerListId) => {

                let yShifter = (50 * (trackIndex + 1)),
                    interTrackGap = 20 * (trackIndex),
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

    areTracksVisible(configuration, trackData) {
        return (_.reduce(trackData, (acc, d) => (!!d || acc), false) && true);
    }


    render() {

        let { configuration, genomeData, isDark,
            trackType, searchResult, linkageData, sourceID } = this.props,
            { isChromosomeModeON = false, genomeView, showScale,
                markerEdge = 'rounded' } = configuration,
            areTracksVisible = true,
            trackData = _.filter(window.synVisio.trackData, (d) => !!d),
            additionalTrackHeight = trackData.length * 140;


        if (sourceID == 'new') {
            configuration.markers = { 'source': ['lc1', 'lc5', 'lc2', 'lc3', 'lc4', 'lc6', 'lc7'], 'target': ['LG1', 'LG5', 'LG2', 'LG3', 'LG4', 'LG6', 'LG7'] };
        }
        else if (sourceID == 'old') {
            configuration.markers = { 'source': ['lc1', 'lc5', 'lc2', 'lc3', 'lc4', 'lc6', 'lc7'], 'target': ['LG1', 'LG5.1', 'LG5.2', 'LG2', 'LG3', 'LG4', 'LG6', 'LG7'] };
        }
        else if (sourceID == 'lr29') {
            configuration.markers = { 'source': ['lc1', 'lc5', 'lc2', 'lc3', 'lc4', 'lc6', 'lc7'], 'target': ['LG0', 'LG14', 'LG6', 'LG11','LG15','LG3'] };
            areTracksVisible = false;
        }


        configuration.isNormalized = true;

        const markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap, false, additionalTrackHeight),
            linkPositions = this.initialiseLinks(genomeData.chromosomeMap, markerPositions, linkageData);

        const trackPositions = areTracksVisible ? this.initialiseTracks(markerPositions, trackType, trackData, showScale) : false;

        const trackHeightFix = areTracksVisible ? (trackData.length * 12) : 0;
        const height = genomeView.height - trackHeightFix + (areTracksVisible ? (additionalTrackHeight + (showScale ? 45 : 20)) : 0);

        const hetMax = _.maxBy(linkageData, (d) => +d.het).het,
            hetMin = _.minBy(linkageData, (d) => +d.het).het,
            distMax = trackData[0].max,
            distMin = trackData[0].min;

            console.log(hetMax,hetMin)
            console.log(distMax,distMin)

        return (
            <div className='genomeViewRoot' style={{ marginTop: '-35px' }}>
                <svg
                    style={{ 'background': isDark ? isChromosomeModeON ? '#1a1c22' : '#252830' : 'white' }}
                    id={'parallel-plot-graphic'}
                    className={'genomeViewSVG exportable-svg snapshot-thumbnail  ' + (isChromosomeModeON ? 'chrom-mode ' : '') + (markerEdge == 'square' ? 'remove-cap' : '')}
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
                    </g>
                    <HetLegend max={hetMax} min={hetMin}
                        height={genomeView.height} width={configuration.genomeView.width} />
                    <DistortionLegend max={distMax} min={distMin}
                        height={genomeView.height} width={configuration.genomeView.width} />
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
        isDark: state.oracle.isDark,
        sourceID: state.oracle.sourceID
    };
}

export default connect(mapStateToProps)(LinkageView);