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

const dynamicScale = interpolateYlGnBu;

export default class Legend extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() { this.createLegend() }
    componentDidUpdate() { this.createLegend() }

    createLegend = () => {

        const node = this.node;

        const { width, height, min, max } = this.props;

        var sequentialScale = scaleSequential(dynamicScale)
            .domain([0, 1]);

        var legendSequential = legendColor()
            .shapeWidth(20)
            .shapePadding(0)
            .cells(20)
            .orient("horizontal")
            .title("Level of Heterozygosity")
            .titleWidth(500)
            .labels(e => (e['i'] == 0 ? 'Low' : e['i'] == 19 ? 'High' : ''))
            .scale(sequentialScale)

        select(".legendSequential")
            .call(legendSequential);

    }


    render() {

        const { width, height } = this.props;
        const translateTop = height + 60, translateLeft = 200;

        return (
            <svg className='custom-legend' ref={node => this.node = node} width={width}>
                <g className='legendSequential' transform={'translate(' + translateLeft + ',' + translateTop + ')'}>
                </g>
            </svg>
        );
    }
}