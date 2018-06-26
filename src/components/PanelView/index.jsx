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
        
        const margin = { top: 40, right: 40, bottom: 40, left: 40 },
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
            .range([height, 0]);

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
                <title>
                    {alignment.source + " => " + alignment.target +
                        "\n type : " + alignment.type +
                        "\n E value : " + alignment.e_value +
                        "\n score : " + alignment.score +
                        "\n count : " + alignment.count}
                </title>
            </circle>
        });

        // Append axises to the same list
        dotList.push(<line key='panel-x' className='panel-axis' x1={x(0) - 10} y1={y(min) + 10} x2={x(alignmentList.length)} y2={y(min) + 10}></line>);
        dotList.push(<line key='panel-y' className='panel-axis' x1={x(0) - 10} y1={y(min) + 10} x2={x(0) - 10} y2={y(max)}></line>);

        // Append axis labels to the same list
        dotList.push(<text key='label-x' className='label-x panel-label' x={x(alignmentList.length) - 75} y={y(min) + 30} >Alignments</text>);
        dotList.push(<text key='label-y' className='label-y panel-label' x={x(0) - 40} y={y(max) - 20} >Count</text>);


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