import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSnapshotList } from '../redux/actions/actions';
import toastr from '../utils/toastr';
import uniqid from 'uniqid';

class SnapshotCapture extends Component {

    constructor(props) {
        super(props);
        this.storeSnapshot = this.storeSnapshot.bind(this);
    }

    storeSnapshot() {
        let { snapshotList, configuration, setSnapshotList } = this.props, uniqueCode = uniqid();
        //  Treading Dangerous Territory here by polluting the global name space 
        //  But this reduces the load placed on the redux and react global store
        window.synVisio.snapshotStore[uniqueCode] = _.cloneDeep(configuration);
        setSnapshotList([...snapshotList, uniqueCode]);
        toastr["info"]("Current state of visualization stored as a local snapshot", "SNAPSHOT STORED");
    }

    render() {
        return (
            <div className='snapshot-capture' onClick={this.storeSnapshot}>
                <span className="icon icon-camera"></span>
            </div>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { snapshotList: state.oracle.snapshotList, configuration: state.oracle.configuration };
}

function mapDispatchToProps(dispatch) {
    return { setSnapshotList: bindActionCreators(setSnapshotList, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotCapture);
