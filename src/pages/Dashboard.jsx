import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { hashHistory } from 'react-router';
import { Loader } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setSourceID, setLoaderState, setGenomicData } from '../redux/actions/actions';

class Dashboard extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        // get the source name based on window query params
        let { sourceID } = this.props.params;
        const { setSourceID, setLoaderState, setGenomicData } = this.props.actions;

        // Turn on loader
        setLoaderState(true);

        if (!sourceID) {
            // If sourceID is not set then fetch default that is set in the initial state of the application
            hashHistory.push('Dashboard/' + this.props.sourceID);
            sourceID = this.props.sourceID;
        }
        else {
            // update the sourceID set in the state with the new sourceID
            setSourceID(sourceID);
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
        const { loaderState } = this.props;
        return (
            <div className='dashboard-container container m-t'>
                {!loaderState ? <h1 className='m-a text-center'>Dashboard Page Coming Soon ....</h1> : <Loader />}
            </div>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({ setSourceID, setLoaderState, setGenomicData }, dispatch)
    };
}

function mapStateToProps(state, ownProps) {
    return { sourceID: state.oracle.sourceID, loaderState: state.oracle.loaderState };
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);



