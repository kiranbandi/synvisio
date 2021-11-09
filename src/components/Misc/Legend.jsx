import React, { Component } from 'react';
import { scaleSequential, interpolateMagma, select } from 'd3';
import { legendColor } from 'd3-svg-legend';

export default class PieChart extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {

        const node = this.node;

        var sequentialScale = scaleSequential(interpolateMagma)
            .domain([1, 0]);

        var legendSequential = legendColor()
            .shapeWidth(100)
            .cells(10)
            .orient("horizontal")
            .scale(sequentialScale)

        select(".legendSequential")
            .call(legendSequential);

    }


    render() {
        return (
            <div className='text-center'>
                <svg ref={node => this.node = node} width='1050px' style={{ margin: '10px auto', 'fill': 'white' }}>
                    <g className='legendSequential' transform='translate(20,20)'></g>
                </svg>
            </div>

        );
    }
}