import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setConfiguration } from '../redux/actions/actions';

class SnapshotPanel extends Component {

    constructor(props) {
        super(props);
        this.snapshotRecallClick = this.snapshotRecallClick.bind(this);
    }

    snapshotRecallClick(event) {
        const uniqueCode = event.target.id,
            configuration = window.synVisio.snapshotStore[uniqueCode];
        if (configuration) {
            this.props.setConfiguration(_.cloneDeep(configuration));
        }
    }

    render() {

        const { snapshotList } = this.props;

        let snapshotElementList = snapshotList.map((value, index) => {
            return (<button id={value} key={'snapshot-' + index} className="btn btn-info-outline" onClick={this.snapshotRecallClick}>{index + 1}</button>);
        });

        return (
            <div>
                <div className='snapshot-header'>
                    <h4>
                        Snapshot Store
                        <span className="icon icon-chevron-right"></span>
                    </h4>
                </div>
                <div className='snapshot-inner'>
                    <p>{snapshotList.length > 0 ? "Select one of the snapshots below to return to that state" : "No snapshots currently available"}</p>
                    {snapshotElementList}
                </div>
            </div>
        );
    }
}

function mapStateToProps(state) {
    return { snapshotList: state.oracle.snapshotList };
}

function mapDispatchToProps(dispatch) {
    return { setConfiguration: bindActionCreators(setConfiguration, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotPanel);


