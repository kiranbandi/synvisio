import React from 'react';

const CirclePlotChromosomes = ({ circleLayout, isDark }) => {
    const { xdim, ydim, hmargin, vmargin, radius, center_x, center_y, thick, chromosomes } = circleLayout;
    
    // Convert degrees to radians
    const degToRad = (deg) => deg * (Math.PI / 180);
    
    return (
        <g className='circlePlotChromosomesContainer'>
            {chromosomes.map((chr, i) => {
                const startAngle = chr.startAngle;
                const endAngle = chr.endAngle;
                const arcLength = endAngle - startAngle;
                
                // Calculate label position (middle of the arc)
                const labelAngle = (startAngle + endAngle) / 2;
                const labelAngleRad = degToRad(labelAngle);
                
                // Determine label offset based on angle (similar to Java code)
                let labelOffset = 3;
                const labelAngleRadHalf = labelAngleRad;
                if (labelAngleRadHalf > Math.PI / 2 && labelAngleRadHalf < (3 * Math.PI) / 2) {
                    labelOffset = i === 0 ? 2 : 1.5;
                }
                
                const labelRadius = radius + thick + (hmargin / labelOffset);
                const labelX = center_x + Math.cos(labelAngleRad) * labelRadius;
                const labelY = center_y - Math.sin(labelAngleRad) * labelRadius;
                
                // Calculate line positions for chromosome boundaries
                const startAngleRad = degToRad(startAngle);
                const endAngleRad = degToRad(endAngle);
                
                const outerStartX = center_x + Math.cos(startAngleRad) * (radius + thick);
                const outerStartY = center_y - Math.sin(startAngleRad) * (radius + thick);
                const innerStartX = center_x + Math.cos(startAngleRad) * radius;
                const innerStartY = center_y - Math.sin(startAngleRad) * radius;
                
                const outerEndX = center_x + Math.cos(endAngleRad) * (radius + thick);
                const outerEndY = center_y - Math.sin(endAngleRad) * (radius + thick);
                const innerEndX = center_x + Math.cos(endAngleRad) * radius;
                const innerEndY = center_y - Math.sin(endAngleRad) * radius;
                
                // Calculate arc parameters for SVG
                // Java draws arcs clockwise from top (0 degrees)
                // SVG arcs: large-arc-flag (0 or 1), sweep-flag (0 = clockwise, 1 = counter-clockwise)
                const largeArcFlag = arcLength > 180 ? 1 : 0;
                const sweepFlag = 0; // Clockwise
                
                return (
                    <g key={`chromosome-${chr.key}`}>
                        {/* Outer arc - Java: drawArc(hmargin-thick, hmargin-thick, xdim-hmargin-hmargin+2*thick, ...) */}
                        <path
                            d={`M ${outerStartX} ${outerStartY} A ${radius + thick} ${radius + thick} 0 ${largeArcFlag} ${sweepFlag} ${outerEndX} ${outerEndY}`}
                            fill="none"
                            stroke={isDark ? 'white' : 'black'}
                            strokeWidth="1"
                        />
                        
                        {/* Inner arc - Java: drawArc(hmargin, hmargin, xdim-hmargin-hmargin, ...) */}
                        <path
                            d={`M ${innerStartX} ${innerStartY} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${innerEndX} ${innerEndY}`}
                            fill="none"
                            stroke={isDark ? 'white' : 'black'}
                            strokeWidth="1"
                        />
                        
                        {/* Start boundary line */}
                        <line
                            x1={outerStartX}
                            y1={outerStartY}
                            x2={innerStartX}
                            y2={innerStartY}
                            stroke={isDark ? 'white' : 'black'}
                            strokeWidth="1"
                        />
                        
                        {/* End boundary line */}
                        <line
                            x1={outerEndX}
                            y1={outerEndY}
                            x2={innerEndX}
                            y2={innerEndY}
                            stroke={isDark ? 'white' : 'black'}
                            strokeWidth="1"
                        />
                        
                        {/* Chromosome label */}
                        <text
                            x={labelX}
                            y={labelY}
                            fill={isDark ? 'white' : 'black'}
                            fontSize="12"
                            textAnchor="middle"
                            className="circle-plot-chromosome-label"
                        >
                            {chr.key}
                        </text>
                    </g>
                );
            })}
        </g>
    );
};

export default CirclePlotChromosomes;

