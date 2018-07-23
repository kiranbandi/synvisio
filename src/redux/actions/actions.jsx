import * as types from './actionTypes';
import sampleSourceMapper from '../../utils/sampleSourceMapper';
import processAlignment from '../../utils/filterAlignment';
import initialState from '../reducers/initialState';

export function setLoaderState(loaderState) {
    return { type: types.SET_LOADER_STATE, loaderState };
}

export function configureSourceID(sourceID) {
    return dispatch => {
        dispatch(setSourceID(sourceID));
        //reset configuration and snapshot store
        dispatch(setConfiguration(initialState.oracle.configuration));
        dispatch(setSnapshotList([]));
        const sampleDataMarkers = sampleSourceMapper[sourceID];
        if (sampleDataMarkers) {
            dispatch(setRootMarkers(sampleDataMarkers));
        }
    }
}

export function setchromosomeMode(isChromosomeModeON) {
    return { type: types.SET_CHROMOSOME_MODE, isChromosomeModeON };
}

export function setBlockMode(isBlockModeON) {
    return { type: types.SET_BLOCK_MODE, isBlockModeON };
}

export function setSourceID(sourceID) {
    return { type: types.SET_SOURCEID, sourceID };
}

export function setConfiguration(configuration) {
    return { type: types.SET_CONFIGURATION, configuration };
}

export function recreateSnapshot(configuration) {
    return dispatch => {
        dispatch(setConfiguration(configuration));
        dispatch(refineAlignmentList(configuration.filterLevel, configuration.alignmentList));
    };
}

export function setFilterLevel(filterLevel) {
    return { type: types.SET_FILTER_LEVEL, filterLevel };
};

export function setGenomicData(data) {
    const { genomeLibrary, alignmentList, snapshotStore = {}, ...otherData } = data;
    //  Treading Dangerous Territory here by polluting the global name space 
    //  But this reduces the load placed on the redux and react global store
    window.synVisio = { genomeLibrary, alignmentList, snapshotStore };
    return { type: types.SET_GENOME_DATA, data: otherData };
}

export function setRootMarkers(markers) {
    return { type: types.SET_ROOT_MARKERS, markers };
}

export function setALignmentList(alignmentList) {
    return { type: types.SET_ALIGNMENT_LIST, alignmentList };
}

export function setSnapshotList(snapshotList) {
    return { type: types.SET_SNAPSHOT_LIST, snapshotList };
}

export function refineAlignmentList(filterLevel, alignmentList) {

    let updatedAlignmentList = _.map(alignmentList, (o) => {

        if (filterLevel.count != undefined && filterLevel.count.nominalValue > o.count) {
            o.hidden = true;
        }
        else if (filterLevel.score != undefined && filterLevel.score.nominalValue > o.score) {
            o.hidden = true;
        }
        else if (filterLevel.e_value != undefined && filterLevel.e_value.nominalValue > o.e_value && !filterLevel.e_value.adjustToZero) {
            o.hidden = true;
        }
        else if (filterLevel.source && filterLevel.source != o.source) {
            o.hidden = true;
        }
        else if (filterLevel.target && filterLevel.target != o.target) {
            o.hidden = true;
        }
        else if (filterLevel.alignment && !_.isEqual(o, filterLevel.alignment)) {
            o.hidden = true;
        }
        else {
            o.hidden = false;
        }
        return o;
    });

    return dispatch => {
        dispatch(setFilterLevel(filterLevel));
        dispatch(setALignmentList(updatedAlignmentList));
        dispatch(setchromosomeMode(!!(filterLevel.source && filterLevel.target)));
        dispatch(setBlockMode(!!(filterLevel.alignment)));
    };
}

export function filterData(sourceMarkers = [], targetMarkers = []) {
    const markers = { 'source': sourceMarkers, 'target': targetMarkers },
        alignmentList = window.synVisio.alignmentList,
        updatedAlignmentList = processAlignment(markers, alignmentList);
    return dispatch => {
        dispatch(setRootMarkers(markers));
        //reset filter level
        dispatch(setFilterLevel({}));
        dispatch(setchromosomeMode(false));
        dispatch(setBlockMode(false));
        dispatch(setALignmentList(updatedAlignmentList));
    };
}

export function setPlotProps(levelOrType, value) {
    if (levelOrType == 'level') {
        return { type: types.SET_PLOT_LEVEL, value };
    }
    else {
        return { type: types.SET_PLOT_TYPE, value };
    }
}













