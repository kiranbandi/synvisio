import React, { Component } from 'react';
import { select } from 'd3';

export default class AxisLineLabel extends Component {

    constructor(props) {
        super(props);
    }

    // code blurb to center label into the center
    componentDidMount() {
        const type = this.props.type,
            dimension = (type == 'x') ? 'width' : 'height',
            factor = (type == 'x') ? -1 : 1,
            currentPosition = this.props[type];
        select(this.node).attr(type, function () {
            return currentPosition + (factor * (this.getBoundingClientRect()[dimension] / 2));
        });
    }
    componentDidUpdate() {
        const type = this.props.type,
            dimension = (type == 'x') ? 'width' : 'height',
            factor = (type == 'x') ? -1 : 1,
            currentPosition = this.props[type];
        select(this.node).attr(type, function () {
            return currentPosition + (factor * (this.getBoundingClientRect()[dimension] / 2));
        });
    }

    render() {
        const { innerKey, x, y, className = '', text = '' } = this.props;
        return (
            <text
                ref={node => this.node = node} key={innerKey} className={className} x={x} y={y}>
                {text}
            </text>
        );
    }
}  