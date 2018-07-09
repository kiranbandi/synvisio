import React, { Component } from 'react';
import { select } from 'd3';

export default class MarkerText extends Component {

    constructor(props) {
        super(props);
    }

    // code blurb to center text marker units into the center of the marker
    componentDidMount() {
        const currentPosition = this.props.x;
        select(this.node).attr('x', function () {
            return currentPosition - (this.getBoundingClientRect().width / 2);
        });
    }
    componentDidUpdate() {
        const currentPosition = this.props.x;
        select(this.node).attr('x', function () {
            return currentPosition - (this.getBoundingClientRect().width / 2);
        });
    }

    render() {
        return (
            <text
                ref={node => this.node = node}
                key={this.props.outerKey}
                className={this.props.className}
                x={this.props.x}
                y={this.props.y}
                onClick={this.props.onMarkerClick}>
                {this.props.text}
            </text>
        );
    }
}  