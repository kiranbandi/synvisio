import React, { Component } from 'react';
import _ from 'lodash';
import MarkerText from '../GenomeView/MarkerText';
import { refineAlignmentListTree } from '../../redux/actions/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Markers extends Component {

    constructor(props) {
        super(props);
        this.onMarkerClick = this.onMarkerClick.bind(this);
        this.generateMarkerElements = this.generateMarkerElements.bind(this);
    }


    onMarkerClick(event) {
        this.clickedOnce = undefined;
        const markerIndicator = event.target.className.baseVal.split(" ")[2],
            { refineAlignmentListTree, configuration } = this.props,
            markerIdList = markerIndicator.split("-");

        let { filterLevel = {}, multiDualFilter = false } = configuration;

        const prevMarkerIndex = Number(markerIdList[1]) - 1;

        // if there is a list above and the multi dual filter is ON
        if (prevMarkerIndex >= 0 && multiDualFilter) {
            if (filterLevel[prevMarkerIndex]) {
                filterLevel[prevMarkerIndex].target = markerIdList[2];
            }
            else {
                filterLevel[prevMarkerIndex] = {
                    target: markerIdList[2]
                }
            }
        }

        filterLevel[markerIdList[1]] = { source: markerIdList[2] }
        refineAlignmentListTree(filterLevel, configuration.alignmentList);
    }

    generateMarkerElements(configuration, markerPositions) {

        let markerElements = [];

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Add style to elements
                style = {
                    'strokeWidth': '20px',
                    stroke: d.color
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

    render() {

        const { configuration, markerPositions } = this.props,
            markerElements = this.generateMarkerElements(configuration, markerPositions);

        return (
            <g className='markerContainer'>
                {markerElements}
            </g>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentListTree: bindActionCreators(refineAlignmentListTree, dispatch) };
}

export default connect(null, mapDispatchToProps)(Markers);