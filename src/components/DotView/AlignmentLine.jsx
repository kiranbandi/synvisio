import React, { Component } from 'react';

export default class AlignmentLine extends Component {

    constructor(props) {
        super(props);
    }

    generateLinkLines(alignmentLinePositions) {

        return alignmentLinePositions.map((d, i) => {
            return (
                <line
                    className={'alignment-link-lines alignment-link-source-' + d.alignment.source + ' alignment-link-target-' + d.alignment.target}
                    key={"alignment-link-line-" + i}
                    x1={d.x1} y1={d.y1} y2={d.y2} x2={d.x2}>
                    <title>
                        {d.alignment.source + " => " + d.alignment.target +
                            "\n type : " + d.alignment.type +
                            "\n E value : " + d.alignment.e_value +
                            "\n score : " + d.alignment.score +
                            "\n count : " + d.alignment.count}
                    </title>
                </line>);
        });

    }


    render() {
        debugger;
        const { alignmentLinePositions } = this.props,
            AlignmentLineElements = this.generateLinkLines(alignmentLinePositions);

        return (
            <g className='alignmentLinesContainer'>
                {AlignmentLineElements}
            </g>
        );
    }
}  