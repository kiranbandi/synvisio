import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { Loader, MagnumHive, MultiGenomeFilter } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    setLoaderState, setGenomicData,
    setALignmentList, configureSourceID
} from '../redux/actions/actions';

class MultiHive extends Component {

    componentDidMount() {

        const { actions, params } = this.props,
            // get the source name based on window query params
            { sourceID = 'wheat' } = params,
            { setLoaderState, setGenomicData, configureSourceID } = actions;

        // turn loader on
        setLoaderState(true);
        getGenomicsData('multi_genome_' + sourceID)
            .then((d) => {
                configureSourceID(sourceID, false, true);
                setGenomicData(d);
            })
            .finally(() => { setLoaderState(false) });

    }

    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {
        let { loaderState, configuration, genome = {} } = this.props;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap ?
                            <div>
                                <MultiGenomeFilter plotType={'multi-hive'} />
                                <MagnumHive
                                    plotType={'multi-hive'}
                                    configuration={configuration} />
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
        actions: bindActionCreators({
            setLoaderState, setGenomicData,
            setALignmentList, configureSourceID
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        loaderState: state.oracle.loaderState,
        configuration: state.oracle.configuration,
        plotType: state.oracle.plotType,
        genome: state.genome,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(MultiHive);


