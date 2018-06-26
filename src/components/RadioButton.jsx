import React, { Component } from 'react';

export default class RadioButton extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <p>
                <input type="radio"
                    id={this.props.id}
                    value={this.props.value}
                    name="radio-group"
                    checked={this.props.checked}
                    onChange={this.props.onChange} />
                <label htmlFor={this.props.id}>
                    {this.props.label}
                </label>
            </p>
        );
    }
}  