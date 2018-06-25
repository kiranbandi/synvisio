import React, { Component } from 'react';
import { connect } from 'react-redux';
import { scaleLinear, schemeCategory10 } from 'd3';
import _ from 'lodash';

class PanelView extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let { configuration } = this.props;
        const margin = { top: 30, right: 40, bottom: 30, left: 40 },
            width = configuration.panelView.width - margin.left - margin.right,
            height = configuration.panelView.height - margin.top - margin.bottom;

        let { alignmentList = [] } = configuration;

        const max = _.maxBy(alignmentList, 'count').count || 0,
            min = _.minBy(alignmentList, 'count').count || 0;


        let x = scaleLinear()
            .domain([0, alignmentList.length])
            .range([0, width]);

        let y = scaleLinear()
            .domain([min, max])
            .range([0, height]);

        let dotList = alignmentList.map((alignment, index) => {

            const sourceIndex = configuration.markers.source.indexOf(alignment.source),
                style = {
                    'fill': (sourceIndex == -1) ? '#2a859b' : schemeCategory10[sourceIndex % 10]
                };

            return <circle
                key={'scatter-plot-' + index}
                className='scatter-plot-dot'
                r='2.5'
                cx={x(index)}
                cy={y(alignment.count)}
                style={style}>
            </circle>
        });


        return (
            <div className='panelViewRoot' >
                <svg width={configuration.panelView.width} height={configuration.panelView.height} >
                    <g transform={"translate(" + margin.left + "," + margin.top + ")"}>
                        {dotList}
                    </g>
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { configuration: state.oracle.configuration };
}

export default connect(mapStateToProps)(PanelView);