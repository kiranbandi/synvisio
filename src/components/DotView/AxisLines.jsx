import React, { Component } from 'react';
import AxisLineLabel from './AxisLineLabel';

export default class AxisLines extends Component {

    constructor(props) {
        super(props);
    }

    generateaxisLines(configuration, axisLinePositions) {
        // Lots of repetitions happening here but can be changed later 

        const { offset = 0, innerWidth = 0 } = configuration.dotView;

        // First add basic axis lines
        let axisLineElements = [
            // vertical line
            <line className='y-axis dot-view-line'
                key='vertical-line-root' x1={2 * offset} y1={offset}
                x2={2 * offset} y2={innerWidth + offset}>
            </line>,
            // horizontal line
            <line className='x-axis dot-view-line'
                key='horizontal-line-root' x1={2 * offset} y1={offset}
                y2={offset} x2={innerWidth + (2 * offset)}>
            </line>
        ];
        // Add all vertical lines
        axisLineElements.push(axisLinePositions.source.map((d, i) => {
            return <line className={'dot-view-line marker-x-lines marker-x-source-' + d.key}
                key={"vertical-line-" + d.key}
                x1={d.x2} y1={d.y1} y2={d.y2} x2={d.x2}></line>;
        }));

        // Add all vertical line text labels
        axisLineElements.push(axisLinePositions.source.map((d, i) => {
            return <AxisLineLabel className={'marker-x-lines-text dot-plot-markers marker-x-lines-text-' + d.key}
                key={"vertical-line-text-outer-" + d.key}
                innerKey={"vertical-line-text-" + d.key}
                text={d.key}
                type='x'
                x={d.x1 + ((d.x2 - d.x1) / 2)}
                y={d.y1 - 10} />;
        }));

        // Add all horizontal lines
        axisLineElements.push(axisLinePositions.target.map((d, i) => {
            return <line className={'dot-view-line marker-y-lines marker-x-target-' + d.key}
                key={"horizontal-line-" + d.key}
                x1={d.x1} y1={d.y2} y2={d.y2} x2={d.x2}></line>;
        }));

        // Add all vertical line text labels
        axisLineElements.push(axisLinePositions.target.map((d, i) => {
            return <AxisLineLabel className={'marker-y-lines-text dot-plot-markers marker-y-lines-text-' + d.key}
                key={"horizontal-line-text-outer" + d.key}
                innerKey={"horizontal-line-text-" + d.key}
                text={d.key}
                type='y'
                x={d.x1 - 45}
                y={d.y1 + ((d.y2 - d.y1) / 2)} />;
        }));

        return axisLineElements;
    }


    render() {

        const { configuration, axisLinePositions } = this.props,
            axisLineElements = this.generateaxisLines(configuration, axisLinePositions);

        return (
            <g className='axisLinesContainer'>
                {axisLineElements}
            </g>
        );
    }
}  