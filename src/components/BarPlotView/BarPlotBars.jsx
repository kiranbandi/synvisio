import React from 'react';

const BarPlotBars = ({ sourceBars, targetBars, isDark, xdim, ydim, mid_y, vmargin }) => {
    
    return (
        <g className='barPlotBarsContainer'>
            {/* Source bars (top) - filled with colors */}
            {sourceBars.map((bar, i) => (
                <g key={`source-bar-${bar.key}`}>
                    <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill={bar.color}
                        stroke="none"
                    />
                    <text
                        x={bar.x + bar.width / 2}
                        y={bar.y - 5}
                        fill={isDark ? 'white' : 'black'}
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="bar-plot-label"
                    >
                        {bar.key}
                    </text>
                </g>
            ))}
            
            {/* Target bars (bottom) - outlined */}
            {targetBars.map((bar, i) => (
                <g key={`target-bar-${bar.key}`}>
                    <rect
                        x={bar.x}
                        y={bar.y}
                        width={bar.width}
                        height={bar.height}
                        fill="none"
                        stroke={isDark ? 'white' : 'black'}
                        strokeWidth="1"
                    />
                    <text
                        x={bar.x + bar.width / 2}
                        y={bar.y + bar.height + 15}
                        fill={isDark ? 'white' : 'black'}
                        fontSize="16"
                        fontWeight="bold"
                        textAnchor="middle"
                    >
                        {bar.key}
                    </text>
                </g>
            ))}
        </g>
    );
};

export default BarPlotBars;

