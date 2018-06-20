import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';


class FilterPanel extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div id='information-root' className='container'>
                Hello
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { information: state.genome.information };
}

export default connect(mapStateToProps)(FilterPanel);
