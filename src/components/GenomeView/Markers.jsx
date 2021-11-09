import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10 } from 'd3';
import MarkerText from './MarkerText';
import { refineAlignmentList } from '../../redux/actions/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Markers extends Component {

    constructor(props) {
        super(props);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }

    onMarkerClick(event) {
        const markerIndicator = event.target.className.baseVal.split(" ")[2],
            { refineAlignmentList, configuration } = this.props,
            markerId = markerIndicator.indexOf('source') > -1 ? 'source' : 'target';

        let { filterLevel = {} } = configuration;
        filterLevel[markerId] = markerIndicator.split("-")[2];
        refineAlignmentList(filterLevel, configuration.alignmentList);
    }

    generateMarkerElements(configuration, markerPositions) {

        let markerElements = [], { alignmentColor = 'tenColor', colorMap = {}, markerAlternateColor = true } = configuration;

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                if (markerListId == 'source' && alignmentColor == 'tenColor') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    // If a color is present in the color map use it if not default to d3 color
                    let colorPaletteMap = isColorMapAvailable ? (colorMap[d.key] || '#1f77b4') : schemeCategory10[sourceIndex % 10];
                    stroke = (sourceIndex == -1) ? '#808080' : colorPaletteMap;
                } else {

                    if (markerAlternateColor) {
                        stroke = (i % 2 == 0) ? '#3a3a3a' : 'grey';
                    }
                    else {
                        stroke = '#3a3a3a';
                    }

                }
                // Add style to elements
                style = {
                    'strokeWidth': '20px',
                    stroke
                }
                return <line key={markerListId + "-line-" + i}
                    className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                    x1={d.x}
                    y1={d.y}
                    x2={d.x + d.dx}
                    y2={d.y}
                    style={style}
                    onClick={this.onMarkerClick}>
                </line>

            });
            markerElements.push(markerLines);

            // if there are any reversed markers
            // add an arrow that is flipped onto the image to indicate it
            let reversedArrows = markerList.map((d, i) => {
                if (d.reversed) {
                    return <path key={'arrow' + i} className='reverse-arrow'
                        d={"M" + (d.x + d.dx) + ' ' + (d.y + 1) +
                            " l-" + (d.dx - 2) + " 0 l15 5 l0 -10 l-15 5"} />
                }
                else return <path key={'arrow' + i} />;
            });

            markerElements.push(reversedArrows);

            // create marker text units
            let markerTextUnits = markerList.map((d, i) => {

                return <MarkerText
                    key={markerListId + "-markertext-outer" + i}
                    outerKey={markerListId + "-markertext-" + i}
                    className={' markersText marker-' + markerListId + "-" + d.key}
                    x={d.x + (d.dx / 2)}
                    y={d.y + 5}
                    text={d.key}
                    onMarkerClick={this.onMarkerClick} />

            });
            markerElements.push(markerTextUnits);
        });
        return markerElements;
    }


    getMarkerTicks(configuration, markerPositions, isDark) {

        let tickElements = [],
            tickColor = isDark ? 'white' : 'grey';

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

                let verticalShifter = markerListID == 'source' ? -20 : 20;

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

        const { configuration, markerPositions, isDark, areTracksVisible } = this.props,
            markerElements = this.generateMarkerElements(configuration, markerPositions),
            markerTicks = this.getMarkerTicks(configuration, markerPositions, isDark);

        return (
            <g className='markerContainer'>
                {markerElements}
                {configuration.showScale && markerTicks}
            </g>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

export default connect(null, mapDispatchToProps)(Markers);