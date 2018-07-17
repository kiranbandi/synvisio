import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ResetIcon } from '../';
import * as d3 from 'd3';

class BlockView extends Component {

    constructor(props) {
        super(props);
        this.renderAxes = this.renderAxes.bind(this);
    }

    componentDidMount() {
        this.renderAxes();
    }

    componentDidUpdate() {
        this.renderAxes();
    }

    renderAxes() {

        const { configuration } = this.props;
        let { blockView, filterLevel } = configuration;
        const { alignment } = filterLevel;

        const { genomeLibrary } = window.synVisio;

        const innerWidth = blockView.width * 0.8;

        const firstLink = alignment.links[0],
            lastLink = alignment.links[alignment.links.length - 1],
            sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source],
            targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target],
            sourceTrack = {
                'start': genomeLibrary.get(sourceGenes[0]).start,
                'end': genomeLibrary.get(sourceGenes[1]).end,
            },
            targetTrack = {
                'start': genomeLibrary.get(targetGenes[0]).start,
                'end': genomeLibrary.get(targetGenes[1]).end,
            };


        var x_top = d3.scaleLinear()
            .domain([sourceTrack.start, sourceTrack.end])
            .range([0, innerWidth]);

        var xAxis_top = d3.axisTop(x_top)
            .ticks(10)
            .tickPadding(5);

        var x_bottom = d3.scaleLinear()
            .domain([targetTrack.start, targetTrack.end])
            .range([0, innerWidth]);

        var xAxis_bottom = d3.axisBottom(x_bottom)
            .ticks(10)
            .tickPadding(5);

        this.gX_top = d3.select(this.gxTop).call(xAxis_top);
        this.gX_bottom = d3.select(this.gxBottom).call(xAxis_bottom);

    }

    render() {

        const { configuration } = this.props;
        let { blockView, filterLevel } = configuration;

        const leftOffset = blockView.width * 0.1;

        return (
            <div className='blockViewRoot' >
                <svg className='blockViewSVG rounded-corner' ref={node => this.outerG = node} height={blockView.height} width={blockView.width}>
                    <g transform={'translate(' + leftOffset + ',0)'}>
                        <g className='axis axis--x' transform='translate(0,40)' ref={node => this.gxTop = node} > </g>
                        <g className='axis axis--x' transform={'translate(0,' + (blockView.height - 40) + ')'} ref={node => this.gxBottom = node} > </g>
                    </g>
                    <ResetIcon x={blockView.width - 50} y={20} onClick={this.resetZoom} />
                </svg>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {};
}

export default connect(mapStateToProps)(BlockView);