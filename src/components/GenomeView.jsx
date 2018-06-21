import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { select, schemeCategory10 } from 'd3';

class GenomeView extends Component {

    constructor(props) {
        super(props);
    }

    initialiseMarkers(configuration, chromosomeCollection, maxWidthAvailable) {

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



    render() {
        const { configuration, genomeData } = this.props,
            maxWidth = select('#root').node().clientWidth,
            markerPositions = this.initialiseMarkers(configuration, genomeData.chromosomeMap, maxWidth);

        let markerElements = [];

        _.map(markerPositions, (markerList, markerListId) => {

            // create marker lines
            let markerLines = markerList.map((d, i) => {
                let stroke, style;
                // Decide on stroke colour
                if (markerListId == 'source') {
                    let sourceIndex = configuration.markers.source.indexOf(d.key);
                    stroke = ((sourceIndex == -1) || sourceIndex > 9) ? '#808080' : schemeCategory10[sourceIndex];
                } else {
                    stroke = (i % 2 == 0) ? '#3a3a3a' : 'grey';
                }
                // Add style to elements
                style = {
                    'strokeWidth': '20px',
                    'strokeLinecap': 'round'
                }
                return <line key={markerListId + "-line-" + i}
                    className={'chromosomeMarkers marker-' + markerListId + " marker-" + markerListId + "-" + d.key}
                    stroke={stroke}
                    x1={d.x}
                    y1={configuration.genomeView.verticalPositions[markerListId]}
                    x2={d.x + d.dx}
                    y2={configuration.genomeView.verticalPositions[markerListId]}
                    style={style}>
                </line>

            });
            markerElements.push(markerLines);

            // create marker text units
            let markerTextUnits = markerList.map((d, i) => {

                return <text key={markerListId + "-markertext-" + i}
                    className={' markersText marker-text-' + markerListId}
                    x={d.x + (d.dx / 2)}
                    y={configuration.genomeView.verticalPositions[markerListId] + 5}>
                    {d.key}
                </text>


            });
            markerElements.push(markerTextUnits);
        });

        return (
            <div className='genomeViewRoot' >
                <svg className='genomeViewSVG' height={configuration.genomeView.height} width={maxWidth}>
                    <g className='markerContainer'>
                        {markerElements}
                    </g>
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { configuration: state.oracle.configuration, genomeData: state.genome };
}

export default connect(mapStateToProps)(GenomeView);