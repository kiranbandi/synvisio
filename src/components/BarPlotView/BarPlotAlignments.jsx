import React from 'react';

const BarPlotAlignments = ({ alignments }) => {
    
    return (
        <g className='barPlotAlignmentsContainer'>
            {alignments.map((alignment, i) => (
                <rect
                    key={`alignment-${i}-${alignment.source}-${alignment.target}`}
                    x={alignment.x}
                    y={alignment.y}
                    width={alignment.width}
                    height={alignment.height}
                    fill={alignment.color}
                    stroke="none"
                />
            ))}
        </g>
    );
};

export default BarPlotAlignments;

