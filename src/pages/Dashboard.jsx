import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { hashHistory } from 'react-router';
import { Loader, HiveView, SingleLevel, SnapshotPanel, SnapshotCapture } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { configureSourceID, setLoaderState, setGenomicData, setALignmentList } from '../redux/actions/actions';


class Dashboard extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // get the source name based on window query params
        let { sourceID } = this.props.params;
        const { multiLevel, actions } = this.props,
            { configureSourceID, setLoaderState, setGenomicData } = actions;

        if (sourceID != 'uploaded-source') {
            // Turn on loader
            setLoaderState(true);
            if (!sourceID) {
                // If sourceID is not set then fetch default that is set in the initial state of the application
                hashHistory.push('Dashboard/' + this.props.sourceID);
                sourceID = this.props.sourceID;
            }
            else {
                // update the sourceID set in the state with the new sourceID
                configureSourceID(sourceID, multiLevel);
            }
            getGenomicsData(sourceID).then((data) => {
                // set the genomic data
                setGenomicData(data);
            }).always(() => {
                // Turn off the loader
                setLoaderState(false);
            });
        }
    }

    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {
        let { loaderState, configuration, genome = {}, multiLevel, plotType } = this.props;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap ?
                            <div>
                                <SnapshotPanel />
                                <SnapshotCapture />
                                {multiLevel ? <HiveView configuration={configuration} /> :
                                    <SingleLevel
                                        plotType={plotType}
                                        configuration={configuration} />}
                            </div>
                            : <h2 className='text-danger text-xs-center m-t-lg'>No data found</h2>}
                    </div>
                    : <Loader />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ configureSourceID, setLoaderState, setGenomicData, setALignmentList }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        sourceID: state.oracle.sourceID,
        loaderState: state.oracle.loaderState,
        configuration: state.oracle.configuration,
        multiLevel: state.oracle.multiLevel,
        plotType: state.oracle.plotType,
        genome: state.genome
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



