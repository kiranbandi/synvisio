import React, { Component } from 'react';
import { select } from 'd3';

export default class AxisLineLabel extends Component {

    constructor(props) {
        super(props);
    }
    
    render() {
        const { innerKey, x, y, onMarkerClick, className = '', text = '' } = this.props;
        return (
            <text
                ref={node => this.node = node}
                key={innerKey}
                className={className}
                x={x} y={y}
                onClick={onMarkerClick}>
                {text}
            </text>
        );
    }
}  