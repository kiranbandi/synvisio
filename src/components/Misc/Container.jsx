import React, { Component } from 'react';
import { NavBar } from '..';

export default class Container extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div id='app-container'>
                <div id='container-body'>
                    {this.props.children}
                </div>
            </div>
        );
    }
}  