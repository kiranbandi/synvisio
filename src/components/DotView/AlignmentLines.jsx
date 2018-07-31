import React, { Component } from 'react';
import { refineAlignmentList } from '../../redux/actions/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class AlignmentLines extends Component {

    constructor(props) {
        super(props);
        this.onLinkClick = this.onLinkClick.bind(this);
    }

    onLinkClick(alignment) {
        let { filterLevel = {}, alignmentList } = this.props.configuration;
        const { refineAlignmentList } = this.props;
        filterLevel['alignment'] = { ...alignment };
        refineAlignmentList(filterLevel, alignmentList);
    }

    render() {
        const { alignmentLinePositions, configuration } = this.props;
        // Titles are displayed in the chromosome view when hovering over a particular element in an svg
        return (
            <g className='alignmentLinesContainer'>
                {alignmentLinePositions.map((d, i) =>
                    <line
                        className={'alignment-link-lines alignment-link-source-' + d.alignment.source + ' alignment-link-target-' + d.alignment.target + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                        key={"alignment-link-line-" + String(d.x1) + '-' + String(d.y1) + '-' + String(d.y2) + '-' + String(d.x2)}
                        x1={d.x1} y1={d.y1}
                        y2={d.y2} x2={d.x2}
                        // Not so elegant but since the number of elements are few this is a workable solution
                        onDoubleClick={configuration.isChromosomeModeON ? this.onLinkClick.bind(this, d.alignment) : null}>
                        {configuration.isChromosomeModeON && <title>
                            {d.alignment.source + " => " + d.alignment.target +
                                "\n type : " + d.alignment.type +
                                "\n E value : " + d.alignment.e_value +
                                "\n score : " + d.alignment.score +
                                "\n count : " + d.alignment.count}
                        </title>}
                    </line>
                )}
            </g>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

export default connect(null, mapDispatchToProps)(AlignmentLines);