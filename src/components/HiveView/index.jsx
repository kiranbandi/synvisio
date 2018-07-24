import React, { Component } from 'react';
import HiveFilterPanel from './HiveFilterPanel';

export default class HiveView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className='hiveView-root'>
                <HiveFilterPanel configuration={this.props.configuration} />
            </div>
        );
    }
}  