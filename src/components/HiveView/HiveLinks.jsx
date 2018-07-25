import React, { Component } from 'react';
import radialLink from './radialLink';
import { schemeCategory10 } from 'd3';

export default class HiveLinks extends Component {

    constructor(props) {
        super(props);
        this.generateLinkElements = this.generateLinkElements.bind(this);
    }

    generateLinkElements() {

        const { linkStore = { links: [], polygons: [] } } = this.props;

        let linkElements = [];

        // Draw links lines for small links
        let genomicLinks = linkStore.links.map((d, i) => {
            let stroke, style;
            stroke = schemeCategory10[7];
            // Add style to elements
            style = {
                'strokeWidth': d.width,
                stroke
            }
            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"hive-link-line-" + i}
                className='hive-link-line'
                d={radialLink().angle((d) => d.angle).radius((d) => d.radius)(d)}
                style={style}> </path>

        });
        linkElements.push(genomicLinks);

        // Draw links Polygons for large links
        let genomicPolygonLinks = linkStore.polygons.map((d, i) => {
            let fill, style;
            // Decide on stroke colour
            fill = schemeCategory10[7];
            // Add style to elements
            style = { fill }
            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"polygon-link-" + i}
                className='hive-link-polygon'
                d={radialLink().angle((d) => d.angle).startRadius((d) => d.startRadius).endRadius((d) => d.endRadius)(d)}
                style={style}>
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
