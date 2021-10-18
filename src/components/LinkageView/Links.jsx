import React, { Component } from 'react';
import _ from 'lodash';
import { schemeCategory10, interpolateNumber } from 'd3';
import { refineAlignmentList } from '../../redux/actions/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';


class Links extends Component {

    constructor(props) {
        super(props);
        this.generateLinkElements = this.generateLinkElements.bind(this);
    }

    createLinkLinePath(d) {
        let curvature = 0.65;
        // code block sourced from d3-sankey https://github.com/d3/d3-sankey for drawing curved blocks
        var x0 = d.source.x,
            x1 = d.target.x,
            y0 = d.source.y,
            y1 = d.target.y,
            yi = interpolateNumber(y0, y1),
            y2 = yi(curvature),
            y3 = yi(1 - curvature);

        return "M" + x0 + "," + y0 + // svg start point
            "C" + x0 + "," + y2 + // curve point 1
            " " + x1 + "," + y3 + // curve point 2
            " " + x1 + "," + y1; // end point
    }


    generateLinkElements() {

        const { configuration, linkPositions, isDark } = this.props,
            { alignmentColor = 'tenColor', colorMap = {}, isChromosomeModeON = true } = configuration;

        let linkElements = [];


        // 0th index has line links and 1st index has polygon links
        // Draw links lines for small links
        let genomicLinks = linkPositions.map((d, i) => {
            let stroke, style;

            stroke = d.color;

            // Add style to elements
            style = {
                'strokeWidth': d.width,
                stroke
            }

            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"line-link-" + i}
                className={'genome-link link hover-link' + ' alignmentID-' + d.alignment.alignmentID + " link-source-" + d.alignment.source + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                d={this.createLinkLinePath(d)}
                style={style}
                // Not so elegant but since the number of elements are few this is a workable solution
                onDoubleClick={isChromosomeModeON ? this.onLinkClick.bind(this, d.alignment) : null}>
                {isChromosomeModeON && <title>
                    {d.alignment.source + " => " + d.alignment.target +
                        "\n type : " + d.alignment.type +
                        "\n E value : " + d.alignment.e_value +
                        "\n score : " + d.alignment.score +
                        "\n count : " + d.alignment.count}
                </title>}
            </path>

        });
        linkElements.push(genomicLinks);

        return linkElements;
    }

    render() {
        return (
            <g className='linkContainer'>
                {this.generateLinkElements()}
            </g>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return { refineAlignmentList: bindActionCreators(refineAlignmentList, dispatch) };
}

export default connect(null, mapDispatchToProps)(Links);