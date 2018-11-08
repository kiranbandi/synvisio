import React, { Component } from 'react';
import TreeFilterPanel from './TreeFilterPanel';
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux';

class TreeView extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        const { configuration, chromosomeMap } = this.props;

        return (
            <div className='treeView-root text-xs-center'>
                <TreeFilterPanel configuration={configuration} chromosomeMap={chromosomeMap} />
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        genomeData: state.genome,
        chromosomeMap: state.genome.chromosomeMap
    };
}

function mapDispatchToProps(dispatch) {
    return { actions: bindActionCreators({  }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(TreeView);