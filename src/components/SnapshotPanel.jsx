import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setConfiguration, setSnapshotList } from '../redux/actions/actions';

class SnapshotPanel extends Component {

    constructor(props) {
        super(props);
        this.snapshotRecallClick = this.snapshotRecallClick.bind(this);
    }

    snapshotRecallClick(event) {

        const targetName = event.target.className,
            uniqueCode = event.currentTarget.id,
            { actions, snapshotList } = this.props,
            { setConfiguration, setSnapshotList } = actions;

        if (targetName.indexOf('snapshot-recall') > -1) {
            const configuration = window.synVisio.snapshotStore[uniqueCode].configuration;
            if (configuration) {
                setConfiguration(_.cloneDeep(configuration));
            }
        }
        else {
            // If a snapshot is to be deleted remove it from the list 
            setSnapshotList(_.filter(snapshotList, (d) => d != uniqueCode));
        }
    }

    render() {

        const { snapshotList } = this.props;

        let snapshotElementList = snapshotList.map((value, index) => {
            return (<button id={value} key={'snapshot-' + index} className="snapshot-button snapshot-recall btn btn-primary-outline" onClick={this.snapshotRecallClick}>
                <div className='close'>
                    <span className='close-marker'>×</span>
                </div>
                <img className='snapshot-recall' height='100' width='250' src={window.synVisio.snapshotStore[value].imgURI} />
            </button>);
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
    return { actions: bindActionCreators({ setConfiguration, setSnapshotList }, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(SnapshotPanel);


