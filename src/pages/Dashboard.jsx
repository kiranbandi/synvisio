import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import processAlignment from '../utils/filterAlignment';
import { hashHistory } from 'react-router';
import { Loader, Information, GenomeView, DotView, PanelView, SnapshotPanel, SnapshotCapture } from '../components';
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
        const { configureSourceID, setLoaderState, setGenomicData } = this.props.actions;

        // Turn on loader
        setLoaderState(true);

        if (!sourceID) {
            // If sourceID is not set then fetch default that is set in the initial state of the application
            hashHistory.push('Dashboard/' + this.props.sourceID);
            sourceID = this.props.sourceID;
        }
        else {
            // update the sourceID set in the state with the new sourceID
            configureSourceID(sourceID);
        }

        getGenomicsData(sourceID).then((data) => {
            // set the genomic data
            setGenomicData(data);
        }).always(() => {
            // Turn off the loader
            setLoaderState(false);
        });
    }

    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {
        let { loaderState, configuration } = this.props,
            { markers, alignmentList = [] } = configuration;

        const isMarkerListEmpty = markers.source.length == 0 || markers.target.length == 0,
            areLinksAvailable = alignmentList.length > 0;


        // if (configuration.isChromosomeModeON) {
        //     // update markers to only the source and target set in the filter panel
        //     const filteredMarkers = {
        //         source: [configuration.filterLevel.source],
        //         target: [configuration.filterLevel.target],
        //     },
        //         // update alignment list for only selected chromosomes
        //         filteredAlignmentList = processAlignment(filteredMarkers, alignmentList);

        //     configuration = {
        //         ...configuration,
        //         markers: filteredMarkers,
        //         alignmentList: filteredAlignmentList
        //     }
        // }


        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <Information />
                        <SnapshotPanel />
                        <SnapshotCapture />
                        {isMarkerListEmpty ?
                            <h2 className='text-danger text-xs-center m-t-lg'>Source or Target Empty</h2> :
                            areLinksAvailable &&
                            <div className='anchor-root'>
                                <GenomeView configuration={configuration} />
                                <DotView configuration={configuration} />
                                <PanelView configuration={configuration} />
                            </div>}
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
        configuration: state.oracle.configuration
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



