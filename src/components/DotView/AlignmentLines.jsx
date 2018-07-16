import React, { Component } from 'react';

export default class AlignmentLines extends Component {

    constructor(props) {
        super(props);
    }


    render() {

        const { alignmentLinePositions } = this.props;

        // Titles are displayed in the chromosome view when hovering over a particular element in an svg

        return (
            <g className='alignmentLinesContainer'>
                {alignmentLinePositions.map((d, i) =>
                    <line
                        className={'alignment-link-lines alignment-link-source-' + d.alignment.source + ' alignment-link-target-' + d.alignment.target + " "}
                        key={"alignment-link-line-" + i}
                        x1={d.x1} y1={d.y1} y2={d.y2} x2={d.x2}>
                        <title>
                            {d.alignment.source + " => " + d.alignment.target +
                                "\n type : " + d.alignment.type +
                                "\n E value : " + d.alignment.e_value +
                                "\n score : " + d.alignment.score +
                                "\n count : " + d.alignment.count}
                        </title>
                    </line>
                )}
            </g>
        );
    }
}  