import React, { Component } from 'react';
import HiveFilterPanel from './HiveFilterPanel';
import HiveMarkers from './HiveMarkers';
import { connect } from 'react-redux';

class HiveView extends Component {

    constructor(props) {
        super(props);
        this.initialiseMarkerPositions = this.initialiseMarkerPositions.bind(this);
    }

    initialiseMarkerPositions() {
        const { configuration, chromosomeMap } = this.props, { markers, hiveView } = configuration;
        const innerRadius = 10;
        const outerRadius = (hiveView.height / 2) - 20;
        const angleFactor = (2 * Math.PI) / Object.keys(markers).length;

        // find the widths for each marker list 
        let widthCollection = _.map(markers, (chromosomeList, markerId) => {
            // for each list we calculate the sum of all the widths of chromosomes in it 
            return { markerId: markerId, width: _.sumBy(chromosomeList, (key) => chromosomeMap.get(key).width) };
        })

        // find the marker list that has the maximum width
        let maxGeneticWidthMarkerList = _.maxBy(widthCollection, (o) => o.width);
        let scaleFactor = (outerRadius) / maxGeneticWidthMarkerList.width;

        let markerPositions = {};
        _.each(markers, (chromosomeList, markerId) => {
            let widthUsedSoFar = innerRadius,
                markerList = _.map(chromosomeList, (key, index) => {
                    let marker = {
                        'data': chromosomeMap.get(key),
                        'key': key,
                        // marker start point = used space so far
                        'x': widthUsedSoFar,
                        // width of the marker
                        'dx': (scaleFactor * chromosomeMap.get(key).width),
                        'angle': angleFactor * markerId
                    }
                    // total width used = previous used space + width
                    widthUsedSoFar = marker.x + marker.dx;
                    return marker;
                })
            markerPositions[markerId] = markerList;
        })
        return markerPositions;
    }

    render() {
        const { configuration, chromosomeMap } = this.props, { alignmentList, hiveView } = configuration;
        const markerPositions = this.initialiseMarkerPositions();

        return (
            <div className='hiveView-root text-xs-center'>
                <HiveFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />

                {alignmentList.length > 0 &&
                    <svg className='hiveViewSVG' height={hiveView.height} width={hiveView.width}>
                        <g ref={node => this.innerG = node} transform={'translate(' + (hiveView.width / 2) + ',' + (hiveView.height / 2) + ')'} >
                            <HiveMarkers configuration={configuration} markerPositions={markerPositions} />
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

export default connect(mapStateToProps)(HiveView);