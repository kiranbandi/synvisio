import React, { Component } from 'react';
import {
    scaleSequential,
    scaleLinear,
    quantize,
    interpolate,
    interpolateRgbBasis,
    interpolateOranges, interpolateReds,
    interpolateGreens, interpolateBlues, line,
    interpolateBuGn, interpolateYlOrRd, interpolateCool,
    interpolateRdBu, interpolatePuOr, interpolateYlGnBu,
    interpolateRdYlBu, interpolateRdYlGn,
    interpolateViridis, interpolateInferno,
    interpolatePlasma, interpolateMagma, select
} from 'd3';

import { legendColor } from 'd3-svg-legend';

let invertedColorScale = quantize(interpolateRdYlBu,40).reverse();

export default class Legend extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {

        const node = this.node;

        const { width, height } = this.props;

        var sequentialScale = scaleSequential(interpolateRgbBasis(invertedColorScale))
            .domain([0, 1]);

        var legendSequential = legendColor()
            .shapeWidth(20)
            .shapePadding(0)
            .cells(20)
            .orient("horizontal")
            .title("% Eston")
            .titleWidth(500)
            .labels(e => (e['i'] == 0 ? 'Low' : e['i'] == 19 ? 'High' : ''))
            .scale(sequentialScale)

        select(".legendSequentialDIS")
            .call(legendSequential);

        // select(".legendSequentialDIS .legendTitle")
        // .style('transform','translate(10%,1%)');


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