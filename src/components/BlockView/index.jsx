import React, { Component } from 'react';
import { ResetIcon } from '../';
import * as d3 from 'd3';

export default class BlockView extends Component {

    constructor(props) {
        super(props);

        this.zoom = d3.zoom()
            .scaleExtent([1, 10])
            .filter(() => !(d3.event.type == 'mouseover'))
            .on("zoom", this.zoomed.bind(this));

        this.resetZoom = this.resetZoom.bind(this);
        this.renderAxes = this.renderAxes.bind(this);
        this.invertTarget = this.invertTarget.bind(this);
    }

    componentDidMount() {
        this.renderAxes();
        d3.select(this.outerG).call(this.zoom);
    }

    componentDidUpdate() {
        this.renderAxes();
        d3.select(this.outerG).call(this.zoom);
    }

    invertTarget() {

        const { configuration } = this.props;
        let { blockView } = configuration;

        const innerWidth = blockView.width * 0.8;

        this.x_bottom = d3.scaleLinear()
            .domain([targetTrack.end, targetTrack.start])
            .range([0, innerWidth]);

        this.xAxis_bottom = d3.axisBottom(this.x_bottom)
            .ticks(10)
            .tickPadding(5);

        this.gX_bottom = d3.select(this.gxBottom).call(this.xAxis_bottom);

        // draw all source markers
        d3.selectAll('.target-marker')
            .transition()
            .duration(500)
            .attr('x1', function (d) {
                return innerWidth - d3.select(this).attr('x1');
            })
            .attr('x2', function (d) {
                return innerWidth - d3.select(this).attr('x2');
            })

        // draw all source markers
        d3.selectAll('.blockview-polylink')
            .transition()
            .duration(500)
            .attr('points', function (d) {
                let currentPoints = d3.select(this).attr('points').split(" "),
                    third_vertex_coordinates = currentPoints[2].split(","),
                    fourth_vertex_coordinates = currentPoints[3].split(",");

                third_vertex_coordinates[0] = innerWidth - third_vertex_coordinates[0];
                fourth_vertex_coordinates[0] = innerWidth - fourth_vertex_coordinates[0];

                return currentPoints[0] +
                    " " + currentPoints[1] +
                    " " + fourth_vertex_coordinates.join(',') +
                    " " + third_vertex_coordinates.join(',');
            })
    }


    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    zoomed() {
        let zoomTransform = d3.event.transform;
        d3.select(this.innerG).style("transform", "translate(" + zoomTransform.x + "px," + "0px) scale(" + zoomTransform.k + ",1)");
        this.gX_top.call(this.xAxis_top.scale(zoomTransform.rescaleX(this.x_top)));
        this.gX_bottom.call(this.xAxis_bottom.scale(zoomTransform.rescaleX(this.x_bottom)));
    }

    renderAxes() {

        const { configuration } = this.props;
        let { blockView } = configuration;

        const innerWidth = blockView.width * 0.8;

        this.x_top = d3.scaleLinear()
            .domain([this.sourceTrack.start, this.sourceTrack.end])
            .range([0, innerWidth]);

        this.x_bottom = d3.scaleLinear()
            .domain([this.targetTrack.start, this.targetTrack.end])
            .range([0, innerWidth]);

        this.xAxis_bottom = d3.axisBottom(this.x_bottom)
            .ticks(10)
            .tickPadding(5);

        this.xAxis_top = d3.axisTop(this.x_top)
            .ticks(10)
            .tickPadding(5);

        this.gX_top = d3.select(this.gxTop).call(this.xAxis_top);
        this.gX_bottom = d3.select(this.gxBottom).call(this.xAxis_bottom);

    }

    render() {

        const { configuration } = this.props;
        let { blockView, filterLevel } = configuration;
        const { alignment } = filterLevel;

        const leftOffset = blockView.width * 0.1, innerWidth = blockView.width * 0.8;

        const { genomeLibrary } = window.synVisio;


        const firstLink = alignment.links[0],
            lastLink = alignment.links[alignment.links.length - 1],
            sourceGenes = genomeLibrary.get(firstLink.source).start < genomeLibrary.get(lastLink.source).start ? [firstLink.source, lastLink.source] : [lastLink.source, firstLink.source],
            targetGenes = genomeLibrary.get(firstLink.target).start < genomeLibrary.get(lastLink.target).start ? [firstLink.target, lastLink.target] : [lastLink.target, firstLink.target];

        this.sourceTrack = {
            'start': genomeLibrary.get(sourceGenes[0]).start,
            'end': genomeLibrary.get(sourceGenes[1]).end,
        };

        this.targetTrack = {
            'start': genomeLibrary.get(targetGenes[0]).start,
            'end': genomeLibrary.get(targetGenes[1]).end,
        };


        let targetScalingFactor = innerWidth / (this.targetTrack.end - this.targetTrack.start),
            sourceScalingFactor = innerWidth / (this.sourceTrack.end - this.sourceTrack.start);

        let sourceMarkers = [], targetMarkers = [], polygonLinks = [];

        // Find the marker positions 
        _.map(alignment.links, (link, index) => {
            // the marker height is 10 px so we add and reduce that to the y postion for top and bottom

            let sourceGene = genomeLibrary.get(link.source),
                targetGene = genomeLibrary.get(link.target);

            const markerPosition = {
                source: {
                    'x1': ((sourceGene.start - this.sourceTrack.start) * sourceScalingFactor),
                    'x2': ((sourceGene.end - this.sourceTrack.start) * sourceScalingFactor),
                    'y': blockView.verticalPositions.source
                },
                target: {
                    'x1': ((targetGene.start - this.targetTrack.start) * targetScalingFactor),
                    'x2': ((targetGene.end - this.targetTrack.start) * targetScalingFactor),
                    'y': blockView.verticalPositions.target
                }
            };

            sourceMarkers.push(
                <line
                    key={'source-marker-' + index}
                    className='blockview-makers source-marker'
                    x1={markerPosition.source.x1}
                    x2={markerPosition.source.x2}
                    y1={markerPosition.source.y}
                    y2={markerPosition.source.y}>
                    <title>{link.source}</title>
                </line>
            );

            targetMarkers.push(
                <line
                    key={'target-marker-' + index}
                    className='blockview-makers target-marker'
                    x1={markerPosition.target.x1}
                    x2={markerPosition.target.x2}
                    y1={markerPosition.target.y}
                    y2={markerPosition.target.y}>
                    <title>{link.target}</title>
                </line>
            );

            polygonLinks.push(
                <polygon
                    className='blockview-polylink'
                    key={'polylink-' + index}
                    points={markerPosition.source.x1 + "," + (markerPosition.source.y + 10) + " " + markerPosition.source.x2 + "," + (markerPosition.source.y + 10) + " " + markerPosition.target.x2 + "," + (markerPosition.target.y - 10) + " " + markerPosition.target.x1 + "," + (markerPosition.target.y - 10)}>
                    <title>{link.source + "==>" + link.target}</title>
                </polygon>
            )

        })

        const containerStyle = {
            height: blockView.height,
            width: blockView.width
        }

        return (
            <div className='blockViewRoot rounded-corner' style={containerStyle} >
                <svg className='blockViewSVG' transform={'translate(' + leftOffset + ',0)'} ref={node => this.outerG = node} height={blockView.height} width={innerWidth}>
                    <g className='axis axis--x' transform='translate(0,40)' ref={node => this.gxTop = node} > </g>
                    <g className='axis axis--x' transform={'translate(0,' + (blockView.height - 40) + ')'} ref={node => this.gxBottom = node} > </g>

                    <g ref={node => this.innerG = node}>
                        <line
                            className='marker-tracks source'
                            x1={0} y1={blockView.verticalPositions.source}
                            x2={innerWidth} y2={blockView.verticalPositions.source} ></line>

                        {sourceMarkers}
                        {targetMarkers}
                        {polygonLinks}

                        <line
                            className='marker-tracks target'
                            x1={0} y1={blockView.verticalPositions.target}
                            x2={innerWidth} y2={blockView.verticalPositions.target} ></line>
                    </g>
                </svg>
            </div>
        );
    }
}
