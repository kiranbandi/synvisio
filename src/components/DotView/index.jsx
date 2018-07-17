import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import AxisLines from './AxisLines';
import AlignmentLines from './AlignmentLines';
import { ResetIcon } from '../';
import * as d3 from 'd3';


class DotView extends Component {

    constructor(props) {
        super(props);
        this.zoom = d3.zoom()
            .scaleExtent([1, 4])
            .filter(() => !(d3.event.type == 'dblclick'))
            .on("zoom", this.zoomed.bind(this));
        this.resetZoom = this.resetZoom.bind(this);
        this.removeZoom = this.removeZoom.bind(this);
        this.attachZoom = this.attachZoom.bind(this);
    }

    componentDidMount() {
        this.attachZoom();
    }
    componentDidUpdate() {
        this.attachZoom();
    }

    attachZoom() {
        if (this.props.configuration.isChromosomeModeON) {
            d3.select(this.outerG)
                .call(this.zoom)
        }
        else {
            this.removeZoom();
        }
    }

    resetZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
    }

    removeZoom() {
        d3.select(this.outerG).call(this.zoom.transform, d3.zoomIdentity.scale(1).translate(0, 0));
        d3.select(this.outerG).on('.zoom', null);
    }

    zoomed() {
        let zoomTransform = d3.event.transform;
        zoomTransform = zoomTransform || { x: 0, y: 0, k: 1 };
        d3.select(this.innerG).attr('transform', 'translate(' + zoomTransform.x + "," + zoomTransform.y + ") scale(" + zoomTransform.k + ")")
    }

    initialisePostions(configuration, chromosomeCollection) {

        let maxWidthAvailable = configuration.dotView.innerWidth;

        let maximumWidthX = _.sumBy(configuration.markers.source, (key) => chromosomeCollection.get(key).width),
            maximumWidthY = _.sumBy(configuration.markers.target, (key) => chromosomeCollection.get(key).width);

        let scaleFactorX = maxWidthAvailable / maximumWidthX,
            scaleFactorY = maxWidthAvailable / maximumWidthY;

        let posistions = {};
        // more padding on the x axis since the labels are horizontal and need more space to the left of the graph
        let sourceWidthUsedSoFar = configuration.dotView.offset;
        posistions.source = _.map(configuration.markers.source, (source, index) => {
            let sourceBit = {
                'data': chromosomeCollection.get(source),
                'key': source,
                'x1': sourceWidthUsedSoFar,
                'x2': sourceWidthUsedSoFar + (scaleFactorX * (chromosomeCollection.get(source).width)),
                'y1': configuration.dotView.offset,
                'y2': configuration.dotView.innerWidth + configuration.dotView.offset
            }
            sourceWidthUsedSoFar = sourceBit.x2;
            return sourceBit;
        });

        let targetWidthUsedSoFar = configuration.dotView.offset;
        posistions.target = _.map(configuration.markers.target, (target, index) => {
            let targetBit = {
                'data': chromosomeCollection.get(target),
                'key': target,
                'y1': targetWidthUsedSoFar,
                'y2': targetWidthUsedSoFar + (scaleFactorY * (chromosomeCollection.get(target).width)),
                'x1': configuration.dotView.offset,
                'x2': configuration.dotView.innerWidth + configuration.dotView.offset
            }
            targetWidthUsedSoFar = targetBit.y2;
            return targetBit;
        });

        return posistions;
    }

    initialiseLines(configuration, axisLinePositions, chromosomeCollection) {

        const { genomeLibrary } = window.synVisio, linkList = [];

        _.map(configuration.alignmentList, (alignment) => {
            if (!configuration.isChromosomeModeON || !alignment.hidden) {
                let firstLink = alignment.links[0],
                    lastLink = alignment.links[alignment.links.length - 1];
                let sourceChromosome = chromosomeCollection.get(alignment.source),
                    targetChromosome = chromosomeCollection.get(alignment.target);
                let sourceLinePosition = _.find(axisLinePositions.source, (o) => o.key == alignment.source),
                    targetLinePosition = _.find(axisLinePositions.target, (o) => o.key == alignment.target);

                let first_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(firstLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
                let last_link_x = sourceLinePosition.x1 + ((genomeLibrary.get(lastLink.source).start - sourceChromosome.start) / sourceChromosome.width) * (sourceLinePosition.x2 - sourceLinePosition.x1);
                let first_link_y = targetLinePosition.y1 + ((genomeLibrary.get(firstLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);
                let last_link_y = targetLinePosition.y1 + ((genomeLibrary.get(lastLink.target).start - targetChromosome.start) / targetChromosome.width) * (targetLinePosition.y2 - targetLinePosition.y1);

                linkList.push({
                    'x1': first_link_x,
                    'x2': last_link_x,
                    'y1': first_link_y,
                    'y2': last_link_y,
                    alignment
                });
            }
        })
        return linkList;
    }


    render() {

        let { configuration, genomeData } = this.props;
        const side_margin = 57.5,
            { isChromosomeModeON = false } = configuration;

        configuration = {
            ...configuration,
            dotView: {
                ...configuration.dotView,
                width: isChromosomeModeON ? configuration.dotView.width - 30 : configuration.dotView.width,
                innerWidth: configuration.dotView.width - (2 * side_margin),
                offset: side_margin
            }
        }

        let axisLinePositions = this.initialisePostions(configuration, genomeData.chromosomeMap),
            alignmentLinePositions = this.initialiseLines(configuration, axisLinePositions, genomeData.chromosomeMap);

        return (
            <div className='dotViewRoot'>
                <svg
                    className={'dotViewSVG ' + (isChromosomeModeON ? 'rounded-corner' : '')}
                    ref={node => this.outerG = node}
                    height={configuration.dotView.width}
                    width={configuration.dotView.width}>

                    <g ref={node => this.innerG = node}>
                        <AxisLines configuration={configuration} axisLinePositions={axisLinePositions} />
                        <AlignmentLines configuration={configuration} alignmentLinePositions={alignmentLinePositions} />
                    </g>
                    {isChromosomeModeON &&
                        <ResetIcon
                            x={configuration.dotView.width - 50}
                            y={20}
                            onClick={this.resetZoom} />}

                </svg>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { genomeData: state.genome };
}

export default connect(mapStateToProps)(DotView);