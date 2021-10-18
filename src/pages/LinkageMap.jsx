import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { Loader, LinkageView, GenomeView } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    configureSourceID, setLoaderState,
    setGenomicData, setALignmentList, filterData, setConfiguration
} from '../redux/actions/actions';
import linkageMapData from '../utils/linkageMapData';


var linkageData = [];

class LinkageMap extends Component {

    componentDidMount() {

        // get the source name based on window query params
        let { sourceID = 'lentils_lg' } = this.props.params;

        const { multiLevel, actions } = this.props,
            { configureSourceID, setLoaderState, setGenomicData, filterData } = actions;

        // Turn on loader
        setLoaderState(true);

        // update the sourceID set in the state with the new sourceID
        configureSourceID(sourceID, multiLevel);


        getGenomicsData(sourceID).then((data) => {


            linkageData = linkageMapData.split('\n').filter((d) => d.length > 0).map((d) => d.trim().split(',')).map((e) => ({
                'locus': 'lc' + e[0].slice(12),
                'position': e[1],
                'linkageID': e[2],
                'distance': +(e[3].trim()),
                'het': +(e[4].trim())
            }));

            var { chromosomeMap, genomeLibrary } = data;

            linkageData.forEach(function (linkage) {

                let chromosomeId = linkage.linkageID,
                    speciesIdentifier = 'lg',
                    geneStart = linkage.distance,
                    geneEnd = linkage.distance + 0.001,
                    geneId = chromosomeId + '_' + linkage.distance;

                // Taking in only non scafflod entries - unwanted entries end up being parsed as NaN and this filters them
                genomeLibrary.set(geneId, {
                    'start': geneStart,
                    'end': geneEnd,
                    // the first 2 characters are the genome name and can be removed
                    'chromosomeId': chromosomeId
                })
                // To create a list of the start and end of all chromosomes
                if (!chromosomeMap.has(chromosomeId)) {
                    chromosomeMap.set(chromosomeId, {
                        start: geneStart,
                        end: geneEnd,
                        'speciesIdentifier': speciesIdentifier
                    });
                } else {
                    var entry = chromosomeMap.get(chromosomeId);
                    if (geneStart < entry.start) {
                        entry.start = geneStart;
                    }
                    if (geneEnd > entry.end) {
                        entry.end = geneEnd;
                    }
                    chromosomeMap.set(chromosomeId, entry);
                }
            })
            // once all parsing is done set width of each chromosome
            chromosomeMap.forEach((chromosome) => {
                chromosome.width = chromosome.end - chromosome.start;
            });

            // set the genomic data
            setGenomicData({ ...data, chromosomeMap, genomeLibrary });

            filterData(['le1', 'le5', 'le2', 'le3', 'le4', 'le6', 'le7'], ['lc1', 'lc5', 'lc2', 'lc3', 'lc4', 'lc6', 'lc7'], {}, false);

        }).finally(() => {
            // Turn off the loader
            setLoaderState(false);
        });
    }

    componentWillUnmount() {
        // clear alignment list 
        this.props.actions.setALignmentList([]);
    }

    render() {

        let { loaderState, configuration, genome = {} } = this.props;
        // transfer the colormap from genome to configuration
        configuration['colorMap'] = genome.colorMap || {};
        configuration.showScale = false;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap ?
                            <div>
                                <GenomeView plotType={'linearplot'} configuration={configuration} />
                                <LinkageView plotType={'linearplot'} configuration={configuration} linkageData={linkageData} />
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
            configureSourceID,
            setLoaderState,
            setGenomicData,
            setALignmentList,
            setConfiguration,
            filterData
        }, dispatch)
    };
}

function mapStateToProps(state) {
    return {
        sourceID: state.oracle.sourceID,
        isModalVisible: state.oracle.isModalVisible,
        loaderState: state.oracle.loaderState,
        configuration: state.oracle.configuration,
        multiLevel: state.oracle.multiLevel,
        multiLevelType: state.oracle.multiLevelType,
        plotType: state.oracle.plotType,
        genome: state.genome,
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(LinkageMap);


