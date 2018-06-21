import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FilterPanel } from './';
import * as d3 from 'd3';

class Information extends Component {

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
            width = (d3.select(".graphic-container").node().getBoundingClientRect().width) / 2,
            radius = width / 2,
            color = d3.scaleOrdinal()
                .range(['#228099', '#746b6b']),
            information = this.props.information;

        if (information) {

            d3.select(node)
                .attr("width", width)
                .attr("height", width / 2);

            let vis = d3.select(innerNode)
                .data([[information.stats.percentage, 100 - information.stats.percentage]])
                .attr('transform', 'translate(' + radius + ',' + radius + ')'),

                arc = d3.arc()
                    .innerRadius(radius / 1.25)
                    .outerRadius(radius),

                pie = d3.pie()
                    .startAngle(-90 * (Math.PI / 180))
                    .endAngle(90 * (Math.PI / 180))
                    .padAngle(.02)
                    .sort(null)
                    .value((d) => d),

                arcs = vis
                    .selectAll("g.slice")
                    .data(pie)
                    .enter()
                    .append("svg:g")
                    .attr("class", "slice")
                    .append("svg:path")
                    .attr("fill", (d, i) => color(i))
                    .attr("d", arc),

                textFiller = vis.append('svg:text')
                    .attr('class', 'pieText')
                    .text(information.stats.percentage + "%")
                    .attr('transform', function () {
                        return 'translate(-' + (this.clientWidth / 2) + ',-' + 0.2 * radius + ')';
                    })
        }

    }

    render() {
        const { information = { parameters: [] } } = this.props,
            informationList = information.parameters.map((val, ind) => <h4 key={ind} className='sub-info'>{val.join(" : ")}</h4>);

        return (
            <div id='information-root' className='container-fluid'>
                <div className='info-container col-sm-12 col-md-4 text-xs-center'>
                    <h2 className='text-primary text-xs-center'>MCScanX Parameters</h2>
                    {informationList}
                </div>
                <div className='graphic-container col-sm-12 col-md-4 text-xs-center'>
                    <h2 className='text-primary text-xs-center'>Share of Collinear Genes</h2>
                    <svg ref={node => this.node = node}>
                        <g className='innerNode' ref={node => this.innerNode = node}></g>
                    </svg>
                </div>
                <div className='graphic-container col-sm-12 col-md-4 text-xs-center'>
                    <h2 className='text-primary text-xs-center'>Filter Panel</h2>
                    <FilterPanel />
                </div>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { information: state.genome.information };
}

export default connect(mapStateToProps)(Information);
