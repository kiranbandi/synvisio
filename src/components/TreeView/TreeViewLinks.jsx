import React, { Component } from 'react';
import _ from 'lodash';
import { interpolateNumber } from 'd3';

export default class TreeViewLinks extends Component {

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

        const { configuration, linkStore = { links: [], polygons: [] } } = this.props;
        let linkElements = [];

        // 0th index has line links and 1st index has polygon links
        // Draw links lines for small links
        let genomicLinks = linkStore.links.map((d, i) => {
            let style;
            // Add style to elements
            style = {
                'strokeWidth': d.width,
                stroke: d.color
            }

            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"line-link-" + i}
                className={'genome-link tree-link-line hover-link' + " link-source-" + d.alignment.source + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                d={this.createLinkLinePath(d)}
                style={style}
                // Not so elegant but since the number of elements are few this is a workable solution
                onDoubleClick={configuration.isChromosomeModeON ? this.onLinkClick.bind(this, d.alignment) : null}>
                {configuration.isChromosomeModeON && <title>
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
        let genomicPolygonLinks = linkStore.polygons.map((d, i) => {
            let fill, style;

            // Add style to elements
            style = { fill: d.color }
            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"line-link-" + i}
                className={'genome-link tree-link-polygon hover-link-polygon' + " link-source-" + d.alignment.source + " " + (d.alignment.hidden ? 'hidden-alignment-link' : '')}
                d={this.createLinkPolygonPath(d)}
                style={style}
                onDoubleClick={configuration.isChromosomeModeON ? this.onLinkClick.bind(this, d.alignment) : null}>
                {configuration.isChromosomeModeON && <title>
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
