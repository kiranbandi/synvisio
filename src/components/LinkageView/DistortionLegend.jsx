import React, { Component } from 'react';
import {
    scaleSequential,
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma, select
} from 'd3';

import { legendColor } from 'd3-svg-legend';

export default class Legend extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {

        const node = this.node;

        const { width, height } = this.props;

        var sequentialScale = scaleSequential(interpolateRdYlBu)
            .domain([0, 1]);

        var legendSequential = legendColor()
            .shapeWidth(20)
            .shapePadding(0)
            .cells(20)
            .orient("horizontal")
            .scale(sequentialScale)
            .title("Level of Distorition")
            .titleWidth(500)
            .labels(e => (e['i'] == 0 ? 'Low' : e['i'] == 19 ? 'High' : ''))
            .scale(sequentialScale)

        select(".legendSequentialDIS")
            .call(legendSequential);

    }


    render() {

        const { width, height } = this.props;
        const translateTop = height + 60, translateLeft = width - 700;

        return (
            <svg className='custom-legend' ref={node => this.node = node} width={width}>
                <g className='legendSequentialDIS' transform={'translate(' + translateLeft + ',' + translateTop + ')'}>
                </g>
            </svg>
        );
    }
}