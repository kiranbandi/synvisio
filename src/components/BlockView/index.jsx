import React, { Component } from 'react';
import { InlayIcon } from '../';
import * as d3 from 'd3';

export default class BlockView extends Component {

    constructor(props) {
        super(props);

        this.zoom = d3.zoom()
            .scaleExtent([1, 20])
            .filter(() => !(d3.event.type == 'mouseover'))
            .on("zoom", this.zoomed.bind(this));

        this.invertState = false;
        this.zoomTransform = d3.zoomIdentity.scale(1).translate(0, 0);
        this.resetZoom = this.resetZoom.bind(this);
        this.renderAxes = this.renderAxes.bind(this);
        this.invertTarget = this.invertTarget.bind(this);
        this.shiftAlignment = this.shiftAlignment.bind(this);
        this.resetAllMarkerPositions = this.resetAllMarkerPositions.bind(this);
    }

    componentDidMount() {
        this.renderAxes();
        d3.select(this.outerG).call(this.zoom);
    }

    componentDidUpdate() {
        this.renderAxes();
        d3.select(this.outerG).call(this.zoom);
    }

    resetAllMarkerPositions() {
        const markerPositionStore = this.markerPositionStore;
        // Get the id of the element based on which get its marker positions and reset all its attributes
        d3.selectAll('.source-marker')
            .attr('x1', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].source.x1; })
            .attr('x2', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].source.x2; })
            .attr('y1', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].source.y; })
            .attr('y2', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].source.y; })

        d3.selectAll('.target-marker')
            .attr('x1', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].target.x1; })
            .attr('x2', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].target.x2; })
            .attr('y1', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].target.y; })
            .attr('y2', function (d) { return markerPositionStore[d3.select(this).attr('id').slice(14)].target.y; })

        d3.selectAll('.blockview-polylink')
            .attr('points', function (d) {
                const markerPosition = markerPositionStore[d3.select(this).attr('id').slice(9)];
                return markerPosition.source.x1 + "," + (markerPosition.source.y + 10) + " " + markerPosition.source.x2 + "," + (markerPosition.source.y + 10) + " " + markerPosition.target.x2 + "," + (markerPosition.target.y - 10) + " " + markerPosition.target.x1 + "," + (markerPosition.target.y - 10);
            })
    }

    shiftAlignment(type = 'left', position = 'top') {

        const shiftDistance = type == 'left' ? -10 : 10;
        // reverse target markers
        d3.selectAll(position == 'top' ? '.source-marker' : '.target-marker')
            .attr('x1', function (d) { return (Number(d3.select(this).attr('x1')) + shiftDistance); })
            .attr('x2', function (d) { return (Number(d3.select(this).attr('x2')) + shiftDistance); })

        // reverse actual links
        d3.selectAll('.blockview-polylink')
            .attr('points', function (d) {
                let currentPoints = d3.select(this).attr('points').split(" "),
                    first_vertex_coordinates = currentPoints[0].split(","),
                    second_vertex_coordinates = currentPoints[1].split(","),
                    third_vertex_coordinates = currentPoints[2].split(","),
                    fourth_vertex_coordinates = currentPoints[3].split(",");

                if (position == 'top') {
                    first_vertex_coordinates[0] = Number(first_vertex_coordinates[0]) + shiftDistance;
                    second_vertex_coordinates[0] = Number(second_vertex_coordinates[0]) + shiftDistance;
                }
                else {
                    third_vertex_coordinates[0] = Number(third_vertex_coordinates[0]) + shiftDistance;
                    fourth_vertex_coordinates[0] = Number(fourth_vertex_coordinates[0]) + shiftDistance;
                }
                return `${first_vertex_coordinates.join(',')} ${second_vertex_coordinates.join(',')} ${third_vertex_coordinates.join(',')} ${fourth_vertex_coordinates.join(',')}`;
            })

        if (position == 'bottom') {
            let currentRange = this.x_bottom.range();
            this.x_bottom = this.x_bottom.range([currentRange[0] + shiftDistance, currentRange[1] + shiftDistance]);
            this.xAxis_bottom = d3.axisBottom(this.x_bottom).ticks(10).tickPadding(5);
            this.gX_bottom = d3.select(this.gxBottom).call(this.xAxis_bottom.scale(this.zoomTransform.rescaleX(this.x_bottom)));

        } else {
            let currentRange = this.x_top.range();
            this.x_top = this.x_top.range([currentRange[0] + shiftDistance, currentRange[1] + shiftDistance]);
            this.xAxis_top = d3.axisTop(this.x_top).ticks(10).tickPadding(5);
            this.gX_top = d3.select(this.gxTop).call(this.xAxis_top.scale(this.zoomTransform.rescaleX(this.x_top)));
        }
    }

    invertTarget() {
        const innerWidth = this.innerWidth;

        this.invertState = !this.invertState;

        this.x_bottom = d3.scaleLinear()
            .domain(this.invertState ? [this.targetTrack.end, this.targetTrack.start] : [this.targetTrack.start, this.targetTrack.end])
            .range([0, innerWidth]);

        this.xAxis_bottom = d3.axisBottom(this.x_bottom)
            .ticks(10)
            .tickPadding(5);

        this.gX_bottom = d3.select(this.gxBottom).call(this.xAxis_bottom.scale(this.zoomTransform.rescaleX(this.x_bottom)));


        // reverse target markers
        d3.selectAll('.target-marker')
            .transition()
            .duration(500)
            .attr('x1', function (d) {
                return innerWidth - Number(d3.select(this).attr('x1'));
            })
            .attr('x2', function (d) {
                return innerWidth - Number(d3.select(this).attr('x2'));
            })

        // reverse actual links
        d3.selectAll('.blockview-polylink')
            .transition()
            .duration(500)
            .attr('points', function (d) {
                let currentPoints = d3.select(this).attr('points').split(" "),
                    third_vertex_coordinates = currentPoints[2].split(","),
                    fourth_vertex_coordinates = currentPoints[3].split(",");

                third_vertex_coordinates[0] = innerWidth - Number(third_vertex_coordinates[0]);
                fourth_vertex_coordinates[0] = innerWidth - Number(fourth_vertex_coordinates[0]);

                return currentPoints[0] +
                    " " + currentPoints[1] +
                    " " + fourth_vertex_coordinates.join(',') +
                    " " + third_vertex_coordinates.join(',');
            })
    }


    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
        this.resetAllMarkerPositions();
        this.renderAxes();
    }

    zoomed() {
        this.zoomTransform = d3.event.transform;
        d3.select(this.innerG).style("transform", "translate(" + this.zoomTransform.x + "px," + "0px) scale(" + this.zoomTransform.k + ",1)");
        this.gX_top.call(this.xAxis_top.scale(this.zoomTransform.rescaleX(this.x_top)));
        this.gX_bottom.call(this.xAxis_bottom.scale(this.zoomTransform.rescaleX(this.x_bottom)));
    }

    renderAxes() {

        const { configuration } = this.props;
        let { blockView } = configuration;

        this.x_top = d3.scaleLinear()
            .domain([this.sourceTrack.start, this.sourceTrack.end])
            .range([0, this.innerWidth]);

        this.x_bottom = d3.scaleLinear()
            .domain([this.targetTrack.start, this.targetTrack.end])
            .range([0, this.innerWidth]);

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

        const { configuration, plotType } = this.props;
        let { blockView, filterLevel } = configuration;
        const { alignment } = filterLevel;

        this.leftOffset = Math.max(blockView.width * 0.075, 135);
        this.innerWidth = blockView.width - (2 * this.leftOffset);

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


        let targetScalingFactor = this.innerWidth / (this.targetTrack.end - this.targetTrack.start),
            sourceScalingFactor = this.innerWidth / (this.sourceTrack.end - this.sourceTrack.start);

        let sourceMarkers = [], targetMarkers = [], polygonLinks = [];

        this.markerPositionStore = [];

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

            this.markerPositionStore[index] = markerPosition;

            sourceMarkers.push(
                <line
                    key={'source-marker-' + index}
                    id={'source-marker-' + index}
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
                    id={'target-marker-' + index}
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
                    id={'polylink-' + index}
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
            <div className={'blockViewRoot rounded-corner' + (plotType != 'dashboard' ? ' m-t' : '')} style={containerStyle} >

                {/* Buttons for resetting zoom and inverting alignment */}
                <InlayIcon onClick={this.resetZoom} right={30} />
                {alignment.type == 'flipped' && <InlayIcon icon='shuffle' onClick={this.invertTarget} right={blockView.width - 80} />}

                {/* Buttons for moving top strand to left or right */}
                <InlayIcon onClick={this.shiftAlignment.bind(this, 'right', 'top')} icon='arrow-right' fontSize={15} right={this.leftOffset - 40} top={blockView.verticalPositions.source - 15} type='info' />
                <InlayIcon onClick={this.shiftAlignment.bind(this, 'left', 'top')} icon='arrow-left' fontSize={15} right={this.innerWidth + this.leftOffset} top={blockView.verticalPositions.source - 15} type='info' />

                {/* Buttons for moving bottom strand to left or right */}
                <InlayIcon onClick={this.shiftAlignment.bind(this, 'right', 'bottom')} icon='arrow-right' fontSize={15} right={this.leftOffset - 40} top={blockView.verticalPositions.target - 15} type='info' />
                <InlayIcon onClick={this.shiftAlignment.bind(this, 'left', 'bottom')} icon='arrow-left' fontSize={15} right={this.innerWidth + this.leftOffset} top={blockView.verticalPositions.target - 15} type='info' />


                <svg className='blockViewSVG' transform={'translate(' + this.leftOffset + ',0)'} ref={node => this.outerG = node} height={blockView.height} width={this.innerWidth}>
                    <g className='axis axis--x' transform='translate(0,40)' ref={node => this.gxTop = node} > </g>
                    <g className='axis axis--x' transform={'translate(0,' + (blockView.height - 40) + ')'} ref={node => this.gxBottom = node} > </g>

                    <g ref={node => this.innerG = node}>
                        <line
                            className='marker-tracks source'
                            x1={0} y1={blockView.verticalPositions.source}
                            x2={this.innerWidth} y2={blockView.verticalPositions.source} ></line>

                        {sourceMarkers}
                        {targetMarkers}
                        {polygonLinks}

                        <line
                            className='marker-tracks target'
                            x1={0} y1={blockView.verticalPositions.target}
                            x2={this.innerWidth} y2={blockView.verticalPositions.target} ></line>
                    </g>
                </svg>
            </div>
        );
    }
}
