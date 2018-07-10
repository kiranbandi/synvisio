import React, { Component } from 'react';
import { connect } from 'react-redux';
import { CollapsibleTrigger } from './';
import Collapsible from 'react-collapsible';

class SnapshotPanel extends Component {

    constructor(props) {
        super(props);
    }

    render() {

        const { snapshotList } = this.props;

        let snapshotElementList = snapshotList.map((value, index) => {
            return (<button key={'snapshot-' + index} className="btn btn-info-outline" onClick={this.onSubmit}>{index + 1}</button>);
        });

        return (
            <Collapsible trigger={<CollapsibleTrigger />} triggerWhenOpen={<CollapsibleTrigger open={true} />}>
                <div className='snapshot-inner'>
                    <p>{snapshotList.length > 0 ? "Select one of the snapshots below to return to that state" : "No snapshots currently available"}</p>
                    {snapshotElementList}
                </div>
            </Collapsible>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return { snapshotList: state.oracle.snapshotList };
}

export default connect(mapStateToProps)(SnapshotPanel);
