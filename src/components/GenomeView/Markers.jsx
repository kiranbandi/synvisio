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

        let markerElements = [];

        _.map(markerPositions, (markerList, markerListId) => {
            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                if (markerListId == 'source') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    stroke = (sourceIndex == -1) ? '#808080' : schemeCategory10[sourceIndex % 10];
                } else {
                    stroke = (i % 2 == 0) ? '#3a3a3a' : 'grey';
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
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

export default connect(null, mapDispatchToProps)(Markers);