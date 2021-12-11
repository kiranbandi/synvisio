import React, { Component } from 'react';
import { getGenomicsData } from '../utils/fetchData';
import { Loader, LinkageView, GenomeView } from '../components';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {
    configureSourceID, setLoaderState, toggleTheme,
    setGenomicData, setALignmentList, filterData, setConfiguration
} from '../redux/actions/actions';
import linkageMapData from '../utils/linkageMapData';
import _ from 'lodash';


var linkageData = [];

class LinkageMap extends Component {

    componentDidMount() {

        // get the source name based on window query params
        let { sourceID = 'new' } = this.props.params;

        const { multiLevel, actions } = this.props,
            { configureSourceID, toggleTheme, setLoaderState, setGenomicData, filterData } = actions;

        // Turn on loader
        setLoaderState(true);
        // For linkage map default to white theme
        toggleTheme();
        // update the sourceID set in the state with the new sourceID
        configureSourceID(sourceID, multiLevel);

        getGenomicsData('lentils_lg').then((data) => {

            let dataKey = 'newReferenceMap';

            if (sourceID == 'old') {
                dataKey = 'oldReferenceMap';
            }
            else if (sourceID == 'lr29') {
                dataKey = 'twentynineReferenceMap'
            }
            let linkageRawData = linkageMapData[dataKey];

            linkageData = linkageRawData.split('\n').filter((d) => d.length > 0).map((d) => d.trim().split(',')).map((e) => ({
                'locus': 'lc' + e[0].slice(12),
                'position': e[1],
                'linkageID': e[2],
                'distance': +(e[3].trim()),
                'score': 2 + (+(e[4] ? e[4].trim() : 0))
            }));

            let hetScoreArray = linkageMapData.newHET
                .split('\n').map((d) => d.trim()).filter((d) => d.length > 1).map((d) => d.split(','))
                .map((d) => ({ 'chr': d[0], 'position': d[1], 'value': d[2] }))

            let hetMap = _.groupBy(hetScoreArray, (e) => e['chr'].toLocaleLowerCase());

            linkageData.map((e) => {
                let matchingRecord = _.find(hetMap[e.locus], (d) => d.position == e.position) || { 'value': 0 };
                e['het'] = matchingRecord.value;
            });

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


            // For track data 
            // First group linkage data by linkage ID
            const trackMin = _.minBy(linkageData, (d) => d.score),
                trackMax = _.maxBy(linkageData, (d) => d.score),
                groupedByLinkageID = _.groupBy(linkageData, (d) => d.linkageID);

            _.map(groupedByLinkageID, (linkageGroupSet, groupKey) => {
                groupedByLinkageID[groupKey] = _.map(linkageGroupSet, (e) => ({
                    'value': e.score,
                    'start': e.distance,
                    'end': e.distance + 0.001,
                }))
            });

            const trackStore = { 'chromosomeMap': groupedByLinkageID, 'min': trackMin.score, 'max': trackMax.score };

            // set the genomic data
            setGenomicData({ ...data, chromosomeMap, genomeLibrary, 'trackData': [trackStore] });

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
        configuration.alignmentColor = 'orientation';
        configuration.markerAlternateColor = false;



        let { sourceID = 'new' } = this.props.params;

        return (
            <div className='dashboard-root m-t'>
                {!loaderState ?
                    <div className='dashboard-container'>
                        {genome.chromosomeMap ?
                            <div>
                                <GenomeView plotType={'linearplot'} configuration={configuration} />
                                <LinkageView sourceID={sourceID} plotType={'linearplot'} configuration={configuration} linkageData={linkageData} />
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
            filterData,
            toggleTheme
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


