import React, { Component } from 'react';
import { connect } from 'react-redux';
import { scaleLinear } from 'd3';
import _ from 'lodash';

class PanelView extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        let { configuration } = this.props;
        const margin = { top: 20, right: 20, bottom: 30, left: 40 },
            width = 800 - margin.left - margin.right,
            height = 450 - margin.top - margin.bottom;


        configuration.panelView.margin = margin;
        configuration.panelView.width = width;
        configuration.panelView.height = height;

        let { alignmentList = [] } = configuration;

        const max = _.maxBy(alignmentList, 'count').count || 0,
            min = _.minBy(alignmentList, 'count').count || 0;


        let x = scaleLinear()
            .domain([0, alignmentList.length])
            .range([0, configuration.panelView.width]);

        let y = scaleLinear()
            .domain([min, max])
            .range([0, configuration.panelView.height]);

        let dotList = alignmentList.map((alignment, index) => {
            return <circle
                key={'scatter-plot-' + index}
                className='scatter-plot-dot'
                r='2.5'
                cx={x(index)}
                cy={y(alignment.count)}>
            </circle>
        });


        return (
            <div className='panelViewRoot m-l-md' >
                <svg width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} >
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