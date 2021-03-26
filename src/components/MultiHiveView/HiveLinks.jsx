import React, { Component } from 'react';
import radialLink from './radialLink';

export default class HiveLinks extends Component {

    constructor(props) {
        super(props);
        this.generateLinkElements = this.generateLinkElements.bind(this);
    }

    generateLinkElements() {

        const { linkStore = { links: [], polygons: [] } } = this.props;
        // Draw links lines for small links
        let genomicLinks = linkStore.links.map((d, i) => {
            let style;
            // Add style to elements
            style = { 'strokeWidth': d.width, stroke: d.color };
            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return <path key={"hive-link-line-" + i}
                className='hive-link-line'
                d={radialLink().angle((d) => d.angle).radius((d) => d.radius)(d)}
                style={style}> </path>

        });

        // Draw links Polygons for large links
        let genomicPolygonLinks = linkStore.polygons.map((d, i) => {
            let style;
            // Add style to elements
            style = { fill: d.color };
            // title is an SVG standard way of providing tooltips, up to the browser how to render this, so changing the style is tricky
            return (
                <path key={"polygon-link-" + i}
                    className='hive-link-polygon'
                    d={radialLink().angle((d) => d.angle).startRadius((d) => d.startRadius).endRadius((d) => d.endRadius)(d)}
                    style={style}>
                </path>);

        });

        return [...genomicLinks, ...genomicPolygonLinks];
    }

    render() {
        return (
            <g className='linkContainer'>
                {this.generateLinkElements()}
            </g>
        );
    }
}
