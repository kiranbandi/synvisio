import React, { Component } from 'react';
import HiveFilterPanel from './HiveFilterPanel';
import { bindActionCreators } from 'redux';
import HiveMarkers from './HiveMarkers';
import HiveLinks from './HiveLinks';
import HiveRadialLabels from './HiveRadialLabels';
import HiveMarkerLabels from './HiveMarkerLabels';
import hiveAngles from './hiveAngles';
import { connect } from 'react-redux';
import { setHiveViewSelectedMarker } from '../../redux/actions/actions';
import { schemeCategory10 } from 'd3';
import { AdvancedFilterPanel } from '../';

class HiveView extends Component {

    constructor(props) {
        super(props);
        // set default inner and outer radius values 
        this.innerRadius = 10;
        this.outerRadius = 500;
        this.initialiseMarkerPositions = this.initialiseMarkerPositions.bind(this);
        this.initialiseLinks = this.initialiseLinks.bind(this);
        this.onMarkerSelect = this.onMarkerSelect.bind(this);
    }

    onMarkerSelect(e) {
        // 11 characters to remove 'hive-label-'
        const markerID = e.target.id.slice(11);
        this.props.actions.setHiveViewSelectedMarker(markerID);
    }

    initialiseMarkerPositions() {
        const { configuration, chromosomeMap } = this.props,
            { reversedMarkers, markers, hiveView, isNormalized = false } = configuration,
            angles = hiveAngles(Object.keys(markers).length);

        this.outerRadius = (hiveView.height / 2) - 50;

        // find the widths for each marker list 
        let widthCollection = _.map(markers, (chromosomeList, markerId) => {
            // for each list we calculate the sum of all the widths of chromosomes in it 
            return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeMap.get(key).width) };
        })

        // find the marker list that has the maximum width
        let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);
        let scaleFactor = (this.outerRadius - this.innerRadius) / maxGeneticWidthMarkerList.width;
        let markerPositions = {};
        _.each(markers, (chromosomeList, markerId) => {

            if (isNormalized) {
                // find the marker list that has the maximum width
                maxGeneticWidthMarkerList = _.find(widthCollection, (o) => o.markerId == markerId);
                scaleFactor = (this.outerRadius - this.innerRadius) / maxGeneticWidthMarkerList.width;
            }


            let widthUsedSoFar = this.innerRadius,
                reversedMarkerList = reversedMarkers[markerId],
                markerList = _.map(chromosomeList, (key, index) => {
                    let marker = {
                        'data': chromosomeMap.get(key),
                        'key': key,
                        // if the chromosome key is in the reverse marker list set it here
                        'reversed': (_.findIndex(reversedMarkerList, (d) => d == key) > -1),
                        // marker start point = used space so far
                        'x': widthUsedSoFar,
                        // width of the marker
                        'dx': (scaleFactor * chromosomeMap.get(key).width),
                        'angle': angles[markerId]
                    }
                    // total width used = previous used space + width
                    widthUsedSoFar = marker.x + marker.dx;
                    return marker;
                })
            markerPositions[markerId] = markerList;
        })
        return markerPositions;
    }

    initialiseLinks(markerPositions) {

        const { configuration, chromosomeMap, sourceID, } = this.props,
            { colorMap = {} } = configuration,
            { selectedMarker = -1 } = configuration.hiveView,
            { genomeLibrary } = window.synVisio;

        // placeholder for color
        let color;

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        let linkStore = { links: [], polygons: [] };

        _.map(configuration.alignmentList, (alignmentDetails) => {

            _.map(alignmentDetails.alignmentList, (alignment) => {

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

                    if (Number(alignmentDetails.source) == Number(selectedMarker)) {

                        color = schemeCategory10[_.findIndex(markerPositions[alignmentDetails.source], (o) => o.key == alignment.source) % 10];
                        // If a color is present in the color map use it if not default to d3 color
                        color = isColorMapAvailable ? (colorMap[alignment.source] || '#1f77b4') : color;
                    }
                    else if (Number(alignmentDetails.target) == Number(selectedMarker)) {
                        color = schemeCategory10[_.findIndex(markerPositions[alignmentDetails.target], (o) => o.key == alignment.target) % 10];
                        // If a color is present in the color map use it if not default to d3 color
                        color = isColorMapAvailable ? (colorMap[alignment.target] || '#1f77b4') : color;
                    }
                    else {
                        color = 'grey';
                    }

                    if (linkWidth == 2) {
                        linkStore.links.push({
                            source: {
                                'radius': sourceMarker.reversed ? sourceMarker.x + sourceMarker.dx - sourceX : sourceMarker.x + sourceX,
                                'angle': sourceMarker.angle
                            },
                            target: {
                                'radius': targetMarker.reversed ? targetMarker.x + targetMarker.dx - targetX : targetMarker.x + targetX,
                                'angle': targetMarker.angle
                            },
                            color
                        })
                    }
                    else {

                        var poyligonCoords = {
                            source: {
                                'startRadius': sourceMarker.reversed ? sourceMarker.x + sourceMarker.dx - sourceX : sourceMarker.x + sourceX,
                                'angle': sourceMarker.angle,
                                'endRadius': sourceMarker.reversed ? sourceMarker.x + sourceMarker.dx - (sourceX + sourceGeneWidth) : sourceMarker.x + sourceX + sourceGeneWidth
                            },
                            target: {
                                'startRadius': targetMarker.reversed ? targetMarker.x + targetMarker.dx - targetX : targetMarker.x + targetX,
                                'angle': targetMarker.angle,
                                'endRadius': targetMarker.reversed ? targetMarker.x + targetMarker.dx - (targetX + targetGeneWidth) : targetMarker.x + targetX + targetGeneWidth
                            },
                            color
                        }

                        // code block to straighten links out if they are reversed
                        // when a marker is flipped the links are reversed too and this code block can
                        // straighten them out
                        if (sourceMarker.reversed && (poyligonCoords.source.startRadius > poyligonCoords.source.endRadius)) {
                            let tempStore = poyligonCoords.source.startRadius;
                            poyligonCoords.source.startRadius = poyligonCoords.source.endRadius;
                            poyligonCoords.source.endRadius = tempStore;
                        }
                        if (targetMarker.reversed && (poyligonCoords.target.startRadius > poyligonCoords.target.endRadius)) {
                            let tempStore = poyligonCoords.target.startRadius;
                            poyligonCoords.target.startRadius = poyligonCoords.target.endRadius;
                            poyligonCoords.target.endRadius = tempStore;
                        }

                        linkStore.polygons.push(poyligonCoords);
                    }
                }
            });
        });
        return linkStore;
    }

    render() {
        const { configuration, chromosomeMap, isDark } = this.props,
            { alignmentList, hiveView, markers, chromosomeLabelsON } = configuration,
            { selectedMarker } = hiveView,
            markerPositions = (Object.keys(markers).length > 1) && this.initialiseMarkerPositions(),
            linkStore = markerPositions ? this.initialiseLinks(markerPositions) : { links: [], polygons: [] };

        return (
            <div className='hiveView-root text-xs-center'>
                <HiveFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
                <AdvancedFilterPanel width={hiveView.width} />
                {alignmentList.length > 0 &&
                    <svg className='hiveViewSVG exportable-svg snapshot-thumbnail '
                        id={'hive-view-graphic'}
                        style={{ 'background': isDark ? '#252830' : 'white' }}
                        height={hiveView.height} width={hiveView.width}>
                        <g ref={node => this.innerG = node} transform={'translate(' + (hiveView.width / 2) + ',' + (hiveView.height / 2) + ')'} >
                            <HiveLinks hiveView={hiveView} linkStore={linkStore} />
                            <HiveMarkers configuration={configuration} markerPositions={markerPositions} />
                            <HiveRadialLabels
                                isDark={isDark}
                                selectedMarker={selectedMarker}
                                markerPositions={markerPositions}
                                onMarkerSelect={this.onMarkerSelect} />
                            {chromosomeLabelsON &&
                                <HiveMarkerLabels
                                    isDark={isDark}
                                    selectedMarker={selectedMarker}
                                    markerPositions={markerPositions} />}
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
    return { actions: bindActionCreators({ setHiveViewSelectedMarker }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(HiveView);