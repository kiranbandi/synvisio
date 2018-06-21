import React, { Component } from 'react';
import { scaleOrdinal, select, arc, pie } from 'd3';

export default class PieChart extends Component {

    constructor(props) {
        super(props);
        this.createPieChart = this.createPieChart.bind(this);
    }

    componentDidMount() {
        this.createPieChart();
    }
    componentDidUpdate() {
        this.createPieChart();
    }

    createPieChart() {

        const node = this.node,
            innerNode = this.innerNode,
            width = (select(this.props.parentClassName).node().getBoundingClientRect().width) / 2,
            radius = width / 2,
            color = scaleOrdinal()
                .range(['#228099', '#746b6b']),
            information = this.props.information;

        if (information) {

            select(node)
                .attr("width", width)
                .attr("height", width / 2);

            let vis = select(innerNode)
                .data([[information.stats.percentage, 100 - information.stats.percentage]])
                .attr('transform', 'translate(' + radius + ',' + radius + ')'),

                pieArc = arc()
                    .innerRadius(radius / 1.25)
                    .outerRadius(radius),

                pieInfo = pie()
                    .startAngle(-90 * (Math.PI / 180))
                    .endAngle(90 * (Math.PI / 180))
                    .padAngle(.02)
                    .sort(null)
                    .value((d) => d),

                arcs = vis
                    .selectAll("g.slice")
                    .data(pieInfo)
                    .enter()
                    .append("svg:g")
                    .attr("class", "slice")
                    .append("svg:path")
                    .attr("fill", (d, i) => color(i))
                    .attr("d", pieArc),

                textFiller = vis.append('svg:text')
                    .attr('class', 'pieText')
                    .text(information.stats.percentage + "%")
                    .attr('transform', function () {
                        return 'translate(-' + (this.clientWidth / 2) + ',-' + 0.2 * radius + ')';
                    })
        }

    }


    render() {
        return (
            <svg ref={node => this.node = node}>
                <g className='innerNode' ref={node => this.innerNode = node}></g>
            </svg>
        );
    }
}  