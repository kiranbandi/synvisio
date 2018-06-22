import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { hashHistory } from 'react-router';
import { Loader, Information, GenomeView } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { configureSourceID, setLoaderState, setGenomicData } from '../redux/actions/actions';


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

    render() {
        const { loaderState, markers } = this.props,
            isMarkerListEmpty = markers.source.length == 0 || markers.target.length == 0;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        <Information />
                        {isMarkerListEmpty ?
                            <h2 className='text-danger text-xs-center m-t-lg'>Source or Target Empty</h2> : <GenomeView />}
                    </div>
                    : <Loader />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ configureSourceID, setLoaderState, setGenomicData }, dispatch)
    };
}

function mapStateToProps(state, ownProps) {
    return {
        sourceID: state.oracle.sourceID,
        markers: state.oracle.configuration.markers,
        loaderState: state.oracle.loaderState
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



