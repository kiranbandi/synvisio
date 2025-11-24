import React from 'react';
import * as d3 from 'd3';

const CirclePlotLinks = ({ links, center_x, center_y }) => {
    
    if (!links || links.length === 0) {
        console.log('CirclePlotLinks: No links provided');
        return <g className='circlePlotLinksContainer'></g>;
    }
    
    console.log('CirclePlotLinks: Rendering', links.length, 'links with center:', center_x, center_y);
    
    // Draw Bezier curve similar to Java code
    const drawBezierPath = (x1, y1, x2, y2) => {
        // Java code uses control points at midpoint between start/end and center
        const cp1x = (x1 + center_x) / 2;
        const cp1y = (y1 + center_y) / 2;
        const cp2x = (x2 + center_x) / 2;
        const cp2y = (y2 + center_y) / 2;
        
        // Create cubic Bezier path
        return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
    };
    
    // Group links by alignment index to use same color
    const groupedLinks = {};
    links.forEach((link, index) => {
        if (!groupedLinks[link.alignmentIndex]) {
            groupedLinks[link.alignmentIndex] = [];
        }
        groupedLinks[link.alignmentIndex].push(link);
    });
    
    const linkElements = [];
    Object.keys(groupedLinks).forEach(alignmentIndex => {
        const alignmentLinks = groupedLinks[alignmentIndex];
        if (!alignmentLinks || alignmentLinks.length === 0) return;
        
        const color = alignmentLinks[0].color;
        
        alignmentLinks.forEach((link, i) => {
            const path = drawBezierPath(link.x1, link.y1, link.x2, link.y2);
            
            linkElements.push(
                <path
                    key={`link-${alignmentIndex}-${i}`}
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity="0.3"
                />
            );
        });
    });
    
    console.log('CirclePlotLinks: Created', linkElements.length, 'path elements');
    
    return (
        <g className='circlePlotLinksContainer'>
            {linkElements}
        </g>
    );
};

export default CirclePlotLinks;

