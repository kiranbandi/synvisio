import React, { Component } from 'react';

export default class RadioButton extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { id = 'radio-default', name = 'radio-group', value = '', checked = false, onChange, label = '', className = '' } = this.props;
        return (
            <p className={className}>
                <input type="radio"
                    id={id}
                    value={value}
                    name={name}
                    checked={checked}
                    onChange={onChange} />
                <label htmlFor={id}>
                    {label}
                </label>
            </p>
        );
    }
}  