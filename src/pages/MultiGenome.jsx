import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { Loader, MagnumView } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    setLoaderState, setGenomicData,
    setALignmentList, filterMultiGenomeData
} from '../redux/actions/actions';

class MultiGenome extends Component {

    componentDidMount() {
        const { actions } = this.props,
            { setLoaderState, setGenomicData, filterMultiGenomeData } = actions;
        // turn loader on
        setLoaderState(true);
        getGenomicsData('multi_genome')
            .then((d) => {
                setGenomicData(d);
                filterMultiGenomeData(d.uniqueIDList);
            })
            .finally(() => { setLoaderState(false) });

    }

    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {
        let { loaderState, configuration, genome = {}, plotType } = this.props;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap ?
                            <div>
                                <MagnumView
                                    plotType={plotType}
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
            setALignmentList, filterMultiGenomeData
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

export default connect(mapStateToProps, mapDispatchToProps)(MultiGenome);


