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

    onLinkClick(alignment) {
        let { filterLevel = {}, alignmentList } = this.props.configuration;
        const { refineAlignmentList } = this.props;
        filterLevel['alignment'] = { ...alignment };
        refineAlignmentList(filterLevel, alignmentList);
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

    createLinkPolygonPath(d) {

        let curvature = 0.65;
        // code block sourced from d3-sankey https://github.com/d3/d3-sankey for drawing curved blocks
        var x = d.source.x,
            x1 = d.target.x,
            y = d.source.y,
            y1 = d.target.y,
            yi = interpolateNumber(y, y1),
            y2 = yi(curvature),
            y3 = yi(1 - curvature),
            p0 = d.target.x1,
            p1 = d.source.x1,
            qi = interpolateNumber(y1, y),
            q2 = qi(curvature),
            q3 = qi(1 - curvature);

        return "M" + x + "," + y + // svg start point
            "C" + x + "," + y2 + // 1st curve point 1
            " " + x1 + "," + y3 + // 1st curve point 2
            " " + x1 + "," + y1 + // 1st curve end point
            "L" + p0 + "," + y1 + // bottom line
            "C" + p0 + "," + q2 + // 2nd curve point 1
            " " + p1 + "," + q3 + // 2nd curve point 2
            " " + p1 + "," + y // end point and move back to start
    }


    generateLinkElements() {

        const { configuration, linkPositions, isDark } = this.props,
            { alignmentColor = 'tenColor', colorMap = {}, isChromosomeModeON = true } = configuration;

        let linkElements = [];

        const isColorMapAvailable = Object.keys(colorMap).length > 0;

        // split links into two parts , the links that have widths of less than 2px can be drawn as lines 
        // and the other are drawn as polygon links
        let link_collection = _.partition(linkPositions, function (link) { return link.width == '2'; });

        // 0th index has line links and 1st index has polygon links
        // Draw links lines for small links
        let genomicLinks = link_collection[0].map((d, i) => {
            let stroke, style;
            // Decide on stroke colour
            let sourceIndex = configuration.markers.source.indexOf(d.alignment.source);

            // If a color is present in the color map use it if not default to d3 color
            let colorPaletteMap = isColorMapAvailable ? (colorMap[d.alignment.source] || '#1f77b4') : schemeCategory10[sourceIndex % 10];

            stroke = (sourceIndex == -1) ? '#808080' : colorPaletteMap;

            // For chromosome mode flipped links are shown in red color and regular in blue
            if (isChromosomeModeON && d.alignment.type == 'flipped') {
                stroke = schemeCategory10[3];
            }
            // If alignment color is overiden by property from chart configuration panel
            if (alignmentColor == 'orientation') {
                stroke = d.alignment.type == 'flipped' ? schemeCategory10[3] : schemeCategory10[0];
            }
            // Add style to elements
            style = {
                'strokeWidth': d.width,
                stroke
            }
            // if the link is part of a search result paint it in white
            if (d.taggedLink) {
                style = {
                    'stroke': isDark ? 'white' : '#434b63',
                    'strokeWidth': '5',
                    'strokeOpacity': 1
                }
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

        // Draw links Polygons for large links
        let genomicPolygonLinks = link_collection[1].map((d, i) => {
            let fill, style;
            // Decide on stroke colour
            let sourceIndex = configuration.markers.source.indexOf(d.alignment.source);

            // If a color is present in the color map use it if not default to d3 color
            let colorPaletteMap = isColorMapAvailable ? (colorMap[d.alignment.source] || '#1f77b4') : schemeCategory10[sourceIndex % 10];


            fill = (sourceIndex == -1) ? '#808080' : colorPaletteMap;

            // For chromosome mode flipped links are shown in red color and regular in blue
            if (isChromosomeModeON && d.alignment.type == 'flipped') {
                fill = schemeCategory10[3];
            }
            // If alignment color is overiden by property from chart configuration panel
            if (alignmentColor == 'orientation') {
                fill = d.alignment.type == 'flipped' ? schemeCategory10[3] : schemeCategory10[0];
            }

            // Add style to elements
            style = { fill }

            // if the link is part of a search result paint it in white
            if (d.taggedLink) {
                style = {
                    'fill': isDark ? 'white' : '#434b63',
                    'fillOpacity': 1
                }
            }

            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"line-link-" + i}
                className={'genome-link link-polygon hover-link-polygon' + ' alignmentID-' + d.alignment.alignmentID + " link-source-" + d.alignment.source + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                d={this.createLinkPolygonPath(d)}
                style={style}
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
        linkElements.push(genomicPolygonLinks);
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